import { Readable } from 'stream';
import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from '@workspace/api-zod';
import { Router, type IRouter, type Request, type Response } from 'express';

import { isAdminUser } from '../lib/adminGuard';
import { ObjectPermission } from '../lib/objectAcl';
import {
  ObjectNotFoundError,
  ObjectStorageService,
} from '../lib/objectStorage';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

/** Only these MIME types are accepted for uploads. */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * Requires the caller to be an authenticated, authorized administrator.
 */
router.post(
  '/storage/uploads/request-url',
  async (req: Request, res: Response) => {
    // Must be a verified admin (not just any authenticated user)
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userId = (req.user as { id: string } | undefined)?.id;
    if (!userId || !isAdminUser(userId)) {
      res.status(403).json({ error: 'Forbidden: not an authorized administrator' });
      return;
    }

    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    const { name, size, contentType } = parsed.data;

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      res.status(400).json({
        error: 'Unsupported file type. Only JPEG, PNG, GIF, and WEBP images are allowed.',
      });
      return;
    }

    // Validate file size
    if (typeof size === 'number' && size > MAX_FILE_SIZE_BYTES) {
      res.status(400).json({
        error: 'File too large. Maximum allowed size is 10 MB.',
      });
      return;
    }

    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json(
        RequestUploadUrlResponse.parse({
          uploadURL,
          objectPath,
          metadata: { name, size, contentType },
        }),
      );
    } catch (error) {
      req.log.error({ err: error }, 'Error generating upload URL');
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  },
);

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * Unconditionally public — no authentication or ACL checks.
 */
router.get(
  '/storage/public-objects/*filePath',
  async (req: Request, res: Response) => {
    try {
      const raw = req.params.filePath;
      const filePath = Array.isArray(raw) ? raw.join('/') : raw;
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const response = await objectStorageService.downloadObject(file);

      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));

      if (response.body) {
        const nodeStream = Readable.fromWeb(
          response.body as ReadableStream<Uint8Array>,
        );
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      req.log.error({ err: error }, 'Error serving public object');
      res.status(500).json({ error: 'Failed to serve file' });
    }
  },
);

/**
 * GET /storage/objects/*
 *
 * Serve private assets — requires authentication.
 * Uses the actual ObjectStorageService API:
 *   1. getObjectEntityFile()  — resolves the GCS File (throws ObjectNotFoundError if absent)
 *   2. canAccessObjectEntity() — enforces ACL (owner / public visibility / rules)
 *   3. downloadObject(File)   — streams the object with correct headers
 */
router.get(
  '/storage/objects/*objectPath',
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const raw = req.params.objectPath;
      const rawSegment = Array.isArray(raw) ? raw.join('/') : raw;

      // getObjectEntityFile expects the path to start with /objects/
      const objectPath = `/objects/${rawSegment}`;

      // Resolve path → GCS File; throws ObjectNotFoundError when absent.
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

      // Enforce ACL — owner, public-visibility, or explicit ACL rules.
      const userId = (req.user as { id: string } | undefined)?.id;
      const hasPermission = await objectStorageService.canAccessObjectEntity({
        userId,
        objectFile,
        requestedPermission: ObjectPermission.READ,
      });
      if (!hasPermission) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Stream the object with correct Content-Type / Cache-Control headers.
      const response = await objectStorageService.downloadObject(objectFile);

      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));

      if (response.body) {
        const nodeStream = Readable.fromWeb(
          response.body as ReadableStream<Uint8Array>,
        );
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({ error: 'File not found' });
        return;
      }
      req.log.error({ err: error }, 'Error serving private object');
      res.status(500).json({ error: 'Failed to serve file' });
    }
  },
);

export default router;
