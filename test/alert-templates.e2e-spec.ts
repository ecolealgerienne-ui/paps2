import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AlertCategory } from '../src/alert-templates/types/alert-category.enum';
import { AlertPriority } from '../src/alert-templates/types/alert-priority.enum';

describe('AlertTemplates (e2e)', () => {
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
    await prisma.alertTemplate.deleteMany({
      where: {
        code: {
          in: ['test_vaccination', 'test_health_check', 'test_feeding'],
        },
      },
    });
  });

  describe('POST /alert-templates', () => {
    it('should create a new alert template', () => {
      return request(app.getHttpServer())
        .post('/alert-templates')
        .send({
          code: 'test_vaccination',
          nameFr: 'Test Vaccination',
          nameEn: 'Test Vaccination',
          nameAr: 'اختبار التطعيم',
          category: AlertCategory.vaccination,
          priority: AlertPriority.high,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.code).toBe('test_vaccination');
          expect(res.body.category).toBe(AlertCategory.vaccination);
          expect(res.body.priority).toBe(AlertPriority.high);
          expect(res.body.version).toBe(1);
          expect(res.body.deletedAt).toBeNull();
        });
    });

    it('should return 409 if code already exists', async () => {
      const dto = {
        code: 'test_vaccination',
        nameFr: 'Test Vaccination',
        nameEn: 'Test Vaccination',
        nameAr: 'اختبار التطعيم',
        category: AlertCategory.vaccination,
        priority: AlertPriority.high,
      };

      // First creation
      await request(app.getHttpServer())
        .post('/alert-templates')
        .send(dto)
        .expect(201);

      // Second creation should fail
      return request(app.getHttpServer())
        .post('/alert-templates')
        .send(dto)
        .expect(409);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/alert-templates')
        .send({
          code: '', // Invalid: empty code
          nameFr: 'Test',
        })
        .expect(400);
    });

    it('should return 400 for invalid enum value', () => {
      return request(app.getHttpServer())
        .post('/alert-templates')
        .send({
          code: 'test_invalid',
          nameFr: 'Test',
          nameEn: 'Test',
          nameAr: 'Test',
          category: 'invalid_category', // Invalid enum
          priority: AlertPriority.high,
        })
        .expect(400);
    });
  });

  describe('GET /alert-templates', () => {
    beforeEach(async () => {
      await prisma.alertTemplate.createMany({
        data: [
          {
            code: 'test_vaccination',
            nameFr: 'Test Vaccination',
            nameEn: 'Test Vaccination',
            nameAr: 'اختبار التطعيم',
            category: AlertCategory.vaccination,
            priority: AlertPriority.high,
          },
          {
            code: 'test_health_check',
            nameFr: 'Test Visite Sanitaire',
            nameEn: 'Test Health Check',
            nameAr: 'اختبار الفحص الصحي',
            category: AlertCategory.health,
            priority: AlertPriority.medium,
          },
          {
            code: 'test_feeding',
            nameFr: 'Test Alimentation',
            nameEn: 'Test Feeding',
            nameAr: 'اختبار التغذية',
            category: AlertCategory.feeding,
            priority: AlertPriority.low,
          },
        ],
      });
    });

    it('should return all alert templates', () => {
      return request(app.getHttpServer())
        .get('/alert-templates')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(3);
        });
    });

    it('should filter by category', () => {
      return request(app.getHttpServer())
        .get(`/alert-templates?category=${AlertCategory.vaccination}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const vaccinations = res.body.filter((t) => t.category === AlertCategory.vaccination);
          expect(vaccinations.length).toBeGreaterThan(0);
        });
    });

    it('should filter by priority', () => {
      return request(app.getHttpServer())
        .get(`/alert-templates?priority=${AlertPriority.high}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const highPriority = res.body.filter((t) => t.priority === AlertPriority.high);
          expect(highPriority.length).toBeGreaterThan(0);
        });
    });

    it('should exclude soft-deleted templates by default', async () => {
      const template = await prisma.alertTemplate.findFirst({
        where: { code: 'test_vaccination' },
      });

      // Soft delete
      await prisma.alertTemplate.update({
        where: { id: template.id },
        data: { deletedAt: new Date() },
      });

      return request(app.getHttpServer())
        .get('/alert-templates')
        .expect(200)
        .expect((res) => {
          const found = res.body.find((t) => t.code === 'test_vaccination');
          expect(found).toBeUndefined();
        });
    });

    it('should include soft-deleted templates when includeDeleted=true', async () => {
      const template = await prisma.alertTemplate.findFirst({
        where: { code: 'test_vaccination' },
      });

      // Soft delete
      await prisma.alertTemplate.update({
        where: { id: template.id },
        data: { deletedAt: new Date() },
      });

      return request(app.getHttpServer())
        .get('/alert-templates?includeDeleted=true')
        .expect(200)
        .expect((res) => {
          const found = res.body.find((t) => t.code === 'test_vaccination');
          expect(found).toBeDefined();
          expect(found.deletedAt).not.toBeNull();
        });
    });
  });

  describe('GET /alert-templates/category/:category', () => {
    beforeEach(async () => {
      await prisma.alertTemplate.create({
        data: {
          code: 'test_vaccination',
          nameFr: 'Test Vaccination',
          nameEn: 'Test Vaccination',
          nameAr: 'اختبار التطعيم',
          category: AlertCategory.vaccination,
          priority: AlertPriority.high,
        },
      });
    });

    it('should return templates by category', () => {
      return request(app.getHttpServer())
        .get(`/alert-templates/category/${AlertCategory.vaccination}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every((t) => t.category === AlertCategory.vaccination)).toBe(true);
        });
    });
  });

  describe('GET /alert-templates/priority/:priority', () => {
    beforeEach(async () => {
      await prisma.alertTemplate.create({
        data: {
          code: 'test_vaccination',
          nameFr: 'Test Vaccination',
          nameEn: 'Test Vaccination',
          nameAr: 'اختبار التطعيم',
          category: AlertCategory.vaccination,
          priority: AlertPriority.high,
        },
      });
    });

    it('should return templates by priority', () => {
      return request(app.getHttpServer())
        .get(`/alert-templates/priority/${AlertPriority.high}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every((t) => t.priority === AlertPriority.high)).toBe(true);
        });
    });
  });

  describe('GET /alert-templates/code/:code', () => {
    beforeEach(async () => {
      await prisma.alertTemplate.create({
        data: {
          code: 'test_vaccination',
          nameFr: 'Test Vaccination',
          nameEn: 'Test Vaccination',
          nameAr: 'اختبار التطعيم',
          category: AlertCategory.vaccination,
          priority: AlertPriority.high,
        },
      });
    });

    it('should return template by code', () => {
      return request(app.getHttpServer())
        .get('/alert-templates/code/test_vaccination')
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe('test_vaccination');
        });
    });

    it('should return 404 for non-existent code', () => {
      return request(app.getHttpServer())
        .get('/alert-templates/code/invalid_code')
        .expect(404);
    });
  });

  describe('GET /alert-templates/:id', () => {
    let templateId: string;

    beforeEach(async () => {
      const template = await prisma.alertTemplate.create({
        data: {
          code: 'test_vaccination',
          nameFr: 'Test Vaccination',
          nameEn: 'Test Vaccination',
          nameAr: 'اختبار التطعيم',
          category: AlertCategory.vaccination,
          priority: AlertPriority.high,
        },
      });
      templateId = template.id;
    });

    it('should return template by id', () => {
      return request(app.getHttpServer())
        .get(`/alert-templates/${templateId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(templateId);
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/alert-templates/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /alert-templates/:id', () => {
    let templateId: string;

    beforeEach(async () => {
      const template = await prisma.alertTemplate.create({
        data: {
          code: 'test_vaccination',
          nameFr: 'Test Vaccination',
          nameEn: 'Test Vaccination',
          nameAr: 'اختبار التطعيم',
          category: AlertCategory.vaccination,
          priority: AlertPriority.high,
        },
      });
      templateId = template.id;
    });

    it('should update a template', () => {
      return request(app.getHttpServer())
        .patch(`/alert-templates/${templateId}`)
        .send({
          nameFr: 'Vaccination Modifiée',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.nameFr).toBe('Vaccination Modifiée');
          expect(res.body.version).toBe(2);
        });
    });

    it('should return 409 on version conflict', async () => {
      // First update
      await request(app.getHttpServer())
        .patch(`/alert-templates/${templateId}`)
        .send({ nameFr: 'Updated 1' })
        .expect(200);

      // Second update with old version should fail
      return request(app.getHttpServer())
        .patch(`/alert-templates/${templateId}`)
        .send({
          nameFr: 'Updated 2',
          version: 1, // Old version
        })
        .expect(409);
    });
  });

  describe('DELETE /alert-templates/:id', () => {
    let templateId: string;

    beforeEach(async () => {
      const template = await prisma.alertTemplate.create({
        data: {
          code: 'test_vaccination',
          nameFr: 'Test Vaccination',
          nameEn: 'Test Vaccination',
          nameAr: 'اختبار التطعيم',
          category: AlertCategory.vaccination,
          priority: AlertPriority.high,
        },
      });
      templateId = template.id;
    });

    it('should soft delete a template', () => {
      return request(app.getHttpServer())
        .delete(`/alert-templates/${templateId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedAt).not.toBeNull();
          expect(res.body.version).toBe(2);
        });
    });

    it('should return 404 for non-existent template', () => {
      return request(app.getHttpServer())
        .delete('/alert-templates/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /alert-templates/:id/restore', () => {
    let templateId: string;

    beforeEach(async () => {
      const template = await prisma.alertTemplate.create({
        data: {
          code: 'test_vaccination',
          nameFr: 'Test Vaccination',
          nameEn: 'Test Vaccination',
          nameAr: 'اختبار التطعيم',
          category: AlertCategory.vaccination,
          priority: AlertPriority.high,
          deletedAt: new Date(),
        },
      });
      templateId = template.id;
    });

    it('should restore a soft-deleted template', () => {
      return request(app.getHttpServer())
        .post(`/alert-templates/${templateId}/restore`)
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedAt).toBeNull();
          expect(res.body.version).toBe(2);
        });
    });

    it('should return 409 if template is not deleted', async () => {
      // First restore
      await request(app.getHttpServer())
        .post(`/alert-templates/${templateId}/restore`)
        .expect(200);

      // Second restore should fail
      return request(app.getHttpServer())
        .post(`/alert-templates/${templateId}/restore`)
        .expect(409);
    });
  });
});
