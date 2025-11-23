import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AdministrationRoutes (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.administrationRoute.deleteMany({
      where: {
        code: {
          in: ['test_oral', 'test_injectable', 'test_topical'],
        },
      },
    });
  });

  describe('POST /administration-routes', () => {
    it('should create a new administration route', () => {
      return request(app.getHttpServer())
        .post('/administration-routes')
        .send({
          code: 'test_oral',
          nameFr: 'Voie orale',
          nameEn: 'Oral route',
          nameAr: 'الطريق الفموي',
          description: 'Medication administered by mouth',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.code).toBe('test_oral');
          expect(res.body.version).toBe(1);
          expect(res.body.deletedAt).toBeNull();
        });
    });

    it('should return 409 if code already exists', async () => {
      const dto = {
        code: 'test_oral',
        nameFr: 'Voie orale',
        nameEn: 'Oral route',
        nameAr: 'الطريق الفموي',
      };

      // First creation
      await request(app.getHttpServer())
        .post('/administration-routes')
        .send(dto)
        .expect(201);

      // Second creation should fail
      return request(app.getHttpServer())
        .post('/administration-routes')
        .send(dto)
        .expect(409);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/administration-routes')
        .send({
          code: '', // Invalid: empty code
          nameFr: 'Voie orale',
        })
        .expect(400);
    });
  });

  describe('GET /administration-routes', () => {
    beforeEach(async () => {
      await prisma.administrationRoute.createMany({
        data: [
          {
            code: 'test_oral',
            nameFr: 'Voie orale',
            nameEn: 'Oral route',
            nameAr: 'الطريق الفموي',
          },
          {
            code: 'test_injectable',
            nameFr: 'Voie injectable',
            nameEn: 'Injectable route',
            nameAr: 'الحقن',
          },
        ],
      });
    });

    it('should return all administration routes', () => {
      return request(app.getHttpServer())
        .get('/administration-routes')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2);
        });
    });

    it('should exclude soft-deleted routes by default', async () => {
      const route = await prisma.administrationRoute.findFirst({
        where: { code: 'test_oral' },
      });

      // Soft delete
      await prisma.administrationRoute.update({
        where: { id: route.id },
        data: { deletedAt: new Date() },
      });

      return request(app.getHttpServer())
        .get('/administration-routes')
        .expect(200)
        .expect((res) => {
          const found = res.body.find((r) => r.code === 'test_oral');
          expect(found).toBeUndefined();
        });
    });

    it('should include soft-deleted routes when includeDeleted=true', async () => {
      const route = await prisma.administrationRoute.findFirst({
        where: { code: 'test_oral' },
      });

      // Soft delete
      await prisma.administrationRoute.update({
        where: { id: route.id },
        data: { deletedAt: new Date() },
      });

      return request(app.getHttpServer())
        .get('/administration-routes?includeDeleted=true')
        .expect(200)
        .expect((res) => {
          const found = res.body.find((r) => r.code === 'test_oral');
          expect(found).toBeDefined();
          expect(found.deletedAt).not.toBeNull();
        });
    });
  });

  describe('GET /administration-routes/code/:code', () => {
    beforeEach(async () => {
      await prisma.administrationRoute.create({
        data: {
          code: 'test_oral',
          nameFr: 'Voie orale',
          nameEn: 'Oral route',
          nameAr: 'الطريق الفموي',
        },
      });
    });

    it('should return route by code', () => {
      return request(app.getHttpServer())
        .get('/administration-routes/code/test_oral')
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe('test_oral');
        });
    });

    it('should return 404 for non-existent code', () => {
      return request(app.getHttpServer())
        .get('/administration-routes/code/invalid_code')
        .expect(404);
    });
  });

  describe('GET /administration-routes/:id', () => {
    let routeId: string;

    beforeEach(async () => {
      const route = await prisma.administrationRoute.create({
        data: {
          code: 'test_oral',
          nameFr: 'Voie orale',
          nameEn: 'Oral route',
          nameAr: 'الطريق الفموي',
        },
      });
      routeId = route.id;
    });

    it('should return route by id', () => {
      return request(app.getHttpServer())
        .get(`/administration-routes/${routeId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(routeId);
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/administration-routes/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /administration-routes/:id', () => {
    let routeId: string;

    beforeEach(async () => {
      const route = await prisma.administrationRoute.create({
        data: {
          code: 'test_oral',
          nameFr: 'Voie orale',
          nameEn: 'Oral route',
          nameAr: 'الطريق الفموي',
        },
      });
      routeId = route.id;
    });

    it('should update a route', () => {
      return request(app.getHttpServer())
        .patch(`/administration-routes/${routeId}`)
        .send({
          nameFr: 'Voie orale modifiée',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.nameFr).toBe('Voie orale modifiée');
          expect(res.body.version).toBe(2);
        });
    });

    it('should return 409 on version conflict', async () => {
      // First update
      await request(app.getHttpServer())
        .patch(`/administration-routes/${routeId}`)
        .send({ nameFr: 'Updated 1' })
        .expect(200);

      // Second update with old version should fail
      return request(app.getHttpServer())
        .patch(`/administration-routes/${routeId}`)
        .send({
          nameFr: 'Updated 2',
          version: 1, // Old version
        })
        .expect(409);
    });
  });

  describe('DELETE /administration-routes/:id', () => {
    let routeId: string;

    beforeEach(async () => {
      const route = await prisma.administrationRoute.create({
        data: {
          code: 'test_oral',
          nameFr: 'Voie orale',
          nameEn: 'Oral route',
          nameAr: 'الطريق الفموي',
        },
      });
      routeId = route.id;
    });

    it('should soft delete a route', () => {
      return request(app.getHttpServer())
        .delete(`/administration-routes/${routeId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedAt).not.toBeNull();
          expect(res.body.version).toBe(2);
        });
    });

    it('should return 404 for non-existent route', () => {
      return request(app.getHttpServer())
        .delete('/administration-routes/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /administration-routes/:id/restore', () => {
    let routeId: string;

    beforeEach(async () => {
      const route = await prisma.administrationRoute.create({
        data: {
          code: 'test_oral',
          nameFr: 'Voie orale',
          nameEn: 'Oral route',
          nameAr: 'الطريق الفموي',
          deletedAt: new Date(),
        },
      });
      routeId = route.id;
    });

    it('should restore a soft-deleted route', () => {
      return request(app.getHttpServer())
        .post(`/administration-routes/${routeId}/restore`)
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedAt).toBeNull();
          expect(res.body.version).toBe(2);
        });
    });

    it('should return 409 if route is not deleted', async () => {
      // First restore
      await request(app.getHttpServer())
        .post(`/administration-routes/${routeId}/restore`)
        .expect(200);

      // Second restore should fail
      return request(app.getHttpServer())
        .post(`/administration-routes/${routeId}/restore`)
        .expect(409);
    });
  });
});
