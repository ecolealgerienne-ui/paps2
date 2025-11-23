import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { MedicalProductType } from '../src/global-medical-products/types/medical-product-type.enum';

describe('GlobalMedicalProducts (e2e)', () => {
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
    await prisma.globalMedicalProduct.deleteMany({
      where: {
        code: {
          in: ['test_amoxicilline', 'test_ivermectine', 'test_meloxicam'],
        },
      },
    });
  });

  describe('POST /global-medical-products', () => {
    it('should create a new global medical product', () => {
      return request(app.getHttpServer())
        .post('/global-medical-products')
        .send({
          code: 'test_amoxicilline',
          nameFr: 'Amoxicilline 500mg Test',
          nameEn: 'Amoxicillin 500mg Test',
          nameAr: 'أموكسيسيلين 500 ملغ اختبار',
          description: 'Antibiotic for bacterial infections',
          type: MedicalProductType.antibiotic,
          principeActif: 'Amoxicilline',
          laboratoire: 'Pfizer',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.code).toBe('test_amoxicilline');
          expect(res.body.type).toBe(MedicalProductType.antibiotic);
          expect(res.body.version).toBe(1);
          expect(res.body.deletedAt).toBeNull();
        });
    });

    it('should return 409 if code already exists', async () => {
      const dto = {
        code: 'test_amoxicilline',
        nameFr: 'Amoxicilline 500mg Test',
        nameEn: 'Amoxicillin 500mg Test',
        nameAr: 'أموكسيسيلين 500 ملغ اختبار',
        type: MedicalProductType.antibiotic,
      };

      // First creation
      await request(app.getHttpServer())
        .post('/global-medical-products')
        .send(dto)
        .expect(201);

      // Second creation should fail
      return request(app.getHttpServer())
        .post('/global-medical-products')
        .send(dto)
        .expect(409);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/global-medical-products')
        .send({
          code: '', // Invalid: empty code
          nameFr: 'Test',
        })
        .expect(400);
    });

    it('should return 400 for invalid enum value', () => {
      return request(app.getHttpServer())
        .post('/global-medical-products')
        .send({
          code: 'test_invalid',
          nameFr: 'Test',
          nameEn: 'Test',
          nameAr: 'Test',
          type: 'invalid_type', // Invalid enum
        })
        .expect(400);
    });
  });

  describe('GET /global-medical-products', () => {
    beforeEach(async () => {
      await prisma.globalMedicalProduct.createMany({
        data: [
          {
            code: 'test_amoxicilline',
            nameFr: 'Amoxicilline Test',
            nameEn: 'Amoxicillin Test',
            nameAr: 'أموكسيسيلين اختبار',
            type: MedicalProductType.antibiotic,
            laboratoire: 'Pfizer',
          },
          {
            code: 'test_ivermectine',
            nameFr: 'Ivermectine Test',
            nameEn: 'Ivermectin Test',
            nameAr: 'إيفرمكتين اختبار',
            type: MedicalProductType.antiparasitic,
            laboratoire: 'Merial',
          },
          {
            code: 'test_meloxicam',
            nameFr: 'Méloxicam Test',
            nameEn: 'Meloxicam Test',
            nameAr: 'ميلوكسيكام اختبار',
            type: MedicalProductType.anti_inflammatory,
            laboratoire: 'Boehringer',
          },
        ],
      });
    });

    it('should return all global medical products', () => {
      return request(app.getHttpServer())
        .get('/global-medical-products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(3);
        });
    });

    it('should filter by type', () => {
      return request(app.getHttpServer())
        .get(`/global-medical-products?type=${MedicalProductType.antibiotic}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const antibiotics = res.body.filter((p) => p.type === MedicalProductType.antibiotic);
          expect(antibiotics.length).toBeGreaterThan(0);
        });
    });

    it('should filter by laboratoire', () => {
      return request(app.getHttpServer())
        .get('/global-medical-products?laboratoire=Pfizer')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const pfizerProducts = res.body.filter((p) => p.laboratoire === 'Pfizer');
          expect(pfizerProducts.length).toBeGreaterThan(0);
        });
    });

    it('should exclude soft-deleted products by default', async () => {
      const product = await prisma.globalMedicalProduct.findFirst({
        where: { code: 'test_amoxicilline' },
      });

      // Soft delete
      await prisma.globalMedicalProduct.update({
        where: { id: product.id },
        data: { deletedAt: new Date() },
      });

      return request(app.getHttpServer())
        .get('/global-medical-products')
        .expect(200)
        .expect((res) => {
          const found = res.body.find((p) => p.code === 'test_amoxicilline');
          expect(found).toBeUndefined();
        });
    });

    it('should include soft-deleted products when includeDeleted=true', async () => {
      const product = await prisma.globalMedicalProduct.findFirst({
        where: { code: 'test_amoxicilline' },
      });

      // Soft delete
      await prisma.globalMedicalProduct.update({
        where: { id: product.id },
        data: { deletedAt: new Date() },
      });

      return request(app.getHttpServer())
        .get('/global-medical-products?includeDeleted=true')
        .expect(200)
        .expect((res) => {
          const found = res.body.find((p) => p.code === 'test_amoxicilline');
          expect(found).toBeDefined();
          expect(found.deletedAt).not.toBeNull();
        });
    });
  });

  describe('GET /global-medical-products/type/:type', () => {
    beforeEach(async () => {
      await prisma.globalMedicalProduct.create({
        data: {
          code: 'test_amoxicilline',
          nameFr: 'Amoxicilline Test',
          nameEn: 'Amoxicillin Test',
          nameAr: 'أموكسيسيلين اختبار',
          type: MedicalProductType.antibiotic,
        },
      });
    });

    it('should return products by type', () => {
      return request(app.getHttpServer())
        .get(`/global-medical-products/type/${MedicalProductType.antibiotic}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.every((p) => p.type === MedicalProductType.antibiotic)).toBe(true);
        });
    });
  });

  describe('GET /global-medical-products/code/:code', () => {
    beforeEach(async () => {
      await prisma.globalMedicalProduct.create({
        data: {
          code: 'test_amoxicilline',
          nameFr: 'Amoxicilline Test',
          nameEn: 'Amoxicillin Test',
          nameAr: 'أموكسيسيلين اختبار',
          type: MedicalProductType.antibiotic,
        },
      });
    });

    it('should return product by code', () => {
      return request(app.getHttpServer())
        .get('/global-medical-products/code/test_amoxicilline')
        .expect(200)
        .expect((res) => {
          expect(res.body.code).toBe('test_amoxicilline');
        });
    });

    it('should return 404 for non-existent code', () => {
      return request(app.getHttpServer())
        .get('/global-medical-products/code/invalid_code')
        .expect(404);
    });
  });

  describe('GET /global-medical-products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await prisma.globalMedicalProduct.create({
        data: {
          code: 'test_amoxicilline',
          nameFr: 'Amoxicilline Test',
          nameEn: 'Amoxicillin Test',
          nameAr: 'أموكسيسيلين اختبار',
          type: MedicalProductType.antibiotic,
        },
      });
      productId = product.id;
    });

    it('should return product by id', () => {
      return request(app.getHttpServer())
        .get(`/global-medical-products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(productId);
        });
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/global-medical-products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /global-medical-products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await prisma.globalMedicalProduct.create({
        data: {
          code: 'test_amoxicilline',
          nameFr: 'Amoxicilline Test',
          nameEn: 'Amoxicillin Test',
          nameAr: 'أموكسيسيلين اختبار',
          type: MedicalProductType.antibiotic,
        },
      });
      productId = product.id;
    });

    it('should update a product', () => {
      return request(app.getHttpServer())
        .patch(`/global-medical-products/${productId}`)
        .send({
          nameFr: 'Amoxicilline Modifiée',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.nameFr).toBe('Amoxicilline Modifiée');
          expect(res.body.version).toBe(2);
        });
    });

    it('should return 409 on version conflict', async () => {
      // First update
      await request(app.getHttpServer())
        .patch(`/global-medical-products/${productId}`)
        .send({ nameFr: 'Updated 1' })
        .expect(200);

      // Second update with old version should fail
      return request(app.getHttpServer())
        .patch(`/global-medical-products/${productId}`)
        .send({
          nameFr: 'Updated 2',
          version: 1, // Old version
        })
        .expect(409);
    });
  });

  describe('DELETE /global-medical-products/:id', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await prisma.globalMedicalProduct.create({
        data: {
          code: 'test_amoxicilline',
          nameFr: 'Amoxicilline Test',
          nameEn: 'Amoxicillin Test',
          nameAr: 'أموكسيسيلين اختبار',
          type: MedicalProductType.antibiotic,
        },
      });
      productId = product.id;
    });

    it('should soft delete a product', () => {
      return request(app.getHttpServer())
        .delete(`/global-medical-products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedAt).not.toBeNull();
          expect(res.body.version).toBe(2);
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .delete('/global-medical-products/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('POST /global-medical-products/:id/restore', () => {
    let productId: string;

    beforeEach(async () => {
      const product = await prisma.globalMedicalProduct.create({
        data: {
          code: 'test_amoxicilline',
          nameFr: 'Amoxicilline Test',
          nameEn: 'Amoxicillin Test',
          nameAr: 'أموكسيسيلين اختبار',
          type: MedicalProductType.antibiotic,
          deletedAt: new Date(),
        },
      });
      productId = product.id;
    });

    it('should restore a soft-deleted product', () => {
      return request(app.getHttpServer())
        .post(`/global-medical-products/${productId}/restore`)
        .expect(200)
        .expect((res) => {
          expect(res.body.deletedAt).toBeNull();
          expect(res.body.version).toBe(2);
        });
    });

    it('should return 409 if product is not deleted', async () => {
      // First restore
      await request(app.getHttpServer())
        .post(`/global-medical-products/${productId}/restore`)
        .expect(200);

      // Second restore should fail
      return request(app.getHttpServer())
        .post(`/global-medical-products/${productId}/restore`)
        .expect(409);
    });
  });
});
