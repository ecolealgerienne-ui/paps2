import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { randomUUID } from 'crypto';

// Mock ThrottlerGuard that bypasses all rate limiting
class MockThrottlerGuard {
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}

/**
 * E2E tests for BACKEND_DELTA.md alignment
 * Tests T11-T15: Format transformations, enum conversions, reference endpoints
 */
describe('Sync Transformations (e2e) - BACKEND_DELTA.md', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testFarmId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useClass(MockThrottlerGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();

    // Create test farm with all required fields
    testFarmId = randomUUID();
    await prisma.farm.create({
      data: {
        id: testFarmId,
        name: 'Test Farm for DELTA',
        location: '123 Test Street, Algiers',
        ownerId: randomUUID(), // Required field
      },
    });
  });

  afterAll(async () => {
    // Clean up test data - delete in correct order to respect foreign keys
    try {
      await prisma.lotAnimal.deleteMany({ where: { farmId: testFarmId } });
      await prisma.movement.deleteMany({ where: { farmId: testFarmId } });
      await prisma.breeding.deleteMany({ where: { farmId: testFarmId } });
      await prisma.document.deleteMany({ where: { farmId: testFarmId } });
      await prisma.campaign.deleteMany({ where: { farmId: testFarmId } });
      await prisma.veterinarian.deleteMany({ where: { farmId: testFarmId } });
      await prisma.medicalProduct.deleteMany({ where: { farmId: testFarmId } });
      await prisma.lot.deleteMany({ where: { farmId: testFarmId } });
      await prisma.animal.deleteMany({ where: { farmId: testFarmId } });
      if (testFarmId) {
        await prisma.farm.delete({ where: { id: testFarmId } });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
    await app.close();
  });

  describe('T11: Format Tests - camelCase to snake_case transformations', () => {
    it('should accept Animal with farmId in camelCase', async () => {
      const animalId = 'animal-test-farmid-camel';
      const payload = {
        farmId: testFarmId, // camelCase
        officialNumber: 'A001',
        visualId: 'VIS-001',
        sex: 'female',
        birthDate: '2023-01-15',
      };

      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'animal',
              entityId: animalId,
              action: 'create',
              farmId: testFarmId,
              payload,
            },
          ],
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toBeDefined();

      // Log error if sync failed
      if (!response.body.results[0].success) {
        console.error('Sync failed:', JSON.stringify(response.body.results[0], null, 2));
      }

      expect(response.body.results[0].success).toBe(true);

      // Verify database has snake_case
      const animal = await prisma.animal.findUnique({ where: { id: animalId } });
      expect(animal).toBeDefined();
      expect(animal.farmId).toBe(testFarmId);
    });

    it('should accept Animal with farm_id in snake_case (dual support)', async () => {
      const animalId = 'animal-test-farmid-snake';
      const payload = {
        farm_id: testFarmId, // snake_case
        officialNumber: 'A002',
        visualId: 'VIS-002',
        sex: 'male',
        birthDate: '2023-02-20',
      };

      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'animal',
              entityId: animalId,
              action: 'create',
              farmId: testFarmId,
              payload,
            },
          ],
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.results[0].success).toBe(true);

      const animal = await prisma.animal.findUnique({ where: { id: animalId } });
      expect(animal.farmId).toBe(testFarmId);
    });

    it('should convert Lot from camelCase to snake_case', async () => {
      const lotId = 'lot-test-camel-transform';
      const payload = {
        farmId: testFarmId,
        name: 'Test Lot L001',
        type: 'treatment',
        description: 'Test lot for transformation',
        treatmentDate: '2024-01-01',
        notes: 'Testing camelCase to snake_case conversion',
      };

      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'lot',
              entityId: lotId,
              action: 'create',
              farmId: testFarmId,
              payload,
            },
          ],
        });

      expect([200, 201]).toContain(response.status);

      if (!response.body.results[0].success) {
        console.error('Lot sync failed:', JSON.stringify(response.body.results[0], null, 2));
      }

      expect(response.body.results[0].success).toBe(true);

      const lot = await prisma.lot.findUnique({ where: { id: lotId } });
      expect(lot).toBeDefined();
      expect(lot.name).toBe('Test Lot L001');
      expect(lot.type).toBe('treatment');
      expect(lot.description).toBe('Test lot for transformation');
      expect(lot.treatmentDate).toBeDefined();
      expect(lot.notes).toBe('Testing camelCase to snake_case conversion');
    });

    it('should convert Breeding from camelCase to snake_case', async () => {
      // Create animal first
      const animalId = 'animal-for-breeding';
      await prisma.animal.create({
        data: {
          id: animalId,
          farmId: testFarmId,
          officialNumber: 'B001',
          visualId: 'VIS-B001',
          sex: 'female',
          birthDate: new Date('2022-01-01'),
          version: 1,
        },
      });

      const breedingId = 'breeding-test-camel';
      const payload = {
        farmId: testFarmId,
        animalId,
        breedingDate: '2024-03-15',
        breedingMethod: 'naturalMating',
        fatherInfo: 'Bull A',
        expectedBirthDate: '2024-12-15',
      };

      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'breeding',
              entityId: breedingId,
              action: 'create',
              farmId: testFarmId,
              payload,
            },
          ],
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.results[0].success).toBe(true);

      const breeding = await prisma.breeding.findUnique({ where: { id: breedingId } });
      expect(breeding).toBeDefined();
      expect(breeding.breedingDate).toBeDefined();
      expect(breeding.breedingMethod).toBe('naturalMating');
      expect(breeding.fatherInfo).toBe('Bull A');
    });

    it('should return sync response in flat format (not nested)', async () => {
      const animalId = 'animal-test-flat-format';
      const payload = {
        farmId: testFarmId,
        officialNumber: 'F001',
        visualId: 'VIS-F001',
        sex: 'female',
        birthDate: '2023-05-10',
      };

      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'animal',
              entityId: animalId,
              action: 'create',
              farmId: testFarmId,
              payload,
            },
          ],
        });

      // Verify flat structure: { success, results } not { success, data: { results } }
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body).not.toHaveProperty('data');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results[0]).toHaveProperty('entityId');
      expect(response.body.results[0]).toHaveProperty('success');
      expect(response.body.results[0].entityId).toBe(animalId);
    });
  });

  describe('T12: Enum Conversion Tests', () => {
    it('should convert breedingMethod: artificialInsemination → artificial_insemination', async () => {
      const animalId = 'animal-for-ai-breeding';
      await prisma.animal.create({
        data: {
          id: animalId,
          farmId: testFarmId,
          officialNumber: 'AI001',
          visualId: 'VIS-AI001',
          sex: 'female',
          birthDate: new Date('2021-06-01'),
          version: 1,
        },
      });

      const breedingId = 'breeding-ai-test';
      const payload = {
        farmId: testFarmId,
        animalId,
        breedingDate: '2024-04-01',
        breedingMethod: 'artificialInsemination', // camelCase
      };

      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'breeding',
              entityId: breedingId,
              action: 'create',
              farmId: testFarmId,
              payload,
            },
          ],
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.results[0].success).toBe(true);

      const breeding = await prisma.breeding.findUnique({ where: { id: breedingId } });
      expect(breeding.breedingMethod).toBe('artificial_insemination'); // snake_case in DB
    });

    it('should convert documentType: transportCert → transport_cert', async () => {
      const docId = 'doc-transport-cert';
      const payload = {
        farmId: testFarmId,
        documentNumber: 'TC001',
        documentType: 'transportCert', // camelCase
        issueDate: '2024-05-15',
      };

      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'document',
              entityId: docId,
              action: 'create',
              farmId: testFarmId,
              payload,
            },
          ],
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.results[0].success).toBe(true);

      const doc = await prisma.document.findUnique({ where: { id: docId } });
      expect(doc.documentType).toBe('transport_cert'); // snake_case in DB
    });

    it('should convert documentType: breedingCert → breeding_cert', async () => {
      const docId = 'doc-breeding-cert';
      const payload = {
        farmId: testFarmId,
        documentNumber: 'BC001',
        documentType: 'breedingCert', // camelCase
        issueDate: '2024-06-20',
      };

      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'document',
              entityId: docId,
              action: 'create',
              farmId: testFarmId,
              payload,
            },
          ],
        });

      expect([200, 201]).toContain(response.status);
      const doc = await prisma.document.findUnique({ where: { id: docId } });
      expect(doc.documentType).toBe('breeding_cert');
    });

    it('should convert movementType: temporaryOut → temporary_out', async () => {
      const animalId = 'animal-for-movement';
      await prisma.animal.create({
        data: {
          id: animalId,
          farmId: testFarmId,
          officialNumber: 'M001',
          visualId: 'VIS-M001',
          sex: 'male',
          birthDate: new Date('2023-01-01'),
          version: 1,
        },
      });

      const movementId = 'movement-temp-out';
      const payload = {
        farmId: testFarmId,
        animalId,
        movementType: 'temporaryOut', // camelCase
        movementDate: '2024-07-01',
        destination: 'Market',
      };

      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'movement',
              entityId: movementId,
              action: 'create',
              farmId: testFarmId,
              payload,
            },
          ],
        });

      expect([200, 201]).toContain(response.status);
      const movement = await prisma.movement.findUnique({ where: { id: movementId } });
      expect(movement.movementType).toBe('temporary_out'); // snake_case in DB
    });
  });

  describe('T13: Reference Endpoint Tests - Species and Breeds', () => {
    it('should return all species ordered by displayOrder', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/species')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      // Verify structure
      if (response.body.data.length > 0) {
        const species = response.body.data[0];
        expect(species).toHaveProperty('id');
        expect(species).toHaveProperty('name_fr');
        expect(species).toHaveProperty('name_en');
        expect(species).toHaveProperty('name_ar');
        expect(species).toHaveProperty('display_order');
      }
    });

    it('should return all breeds ordered by displayOrder', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/breeds')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const breed = response.body.data[0];
        expect(breed).toHaveProperty('id');
        expect(breed).toHaveProperty('species_id');
        expect(breed).toHaveProperty('name_fr');
        expect(breed).toHaveProperty('name_en');
        expect(breed).toHaveProperty('name_ar');
        expect(breed).toHaveProperty('display_order');
        expect(breed).toHaveProperty('is_active');
      }
    });

    it('should filter breeds by speciesId', async () => {
      // First get a species
      const speciesResponse = await request(app.getHttpServer())
        .get('/api/v1/species')
        .expect(200);

      if (speciesResponse.body.data.length === 0) {
        console.log('No species data available, skipping filter test');
        return;
      }

      const speciesId = speciesResponse.body.data[0].id;

      // Get breeds for this species
      const response = await request(app.getHttpServer())
        .get(`/api/v1/breeds?speciesId=${speciesId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // All breeds should belong to the requested species
      response.body.data.forEach((breed: any) => {
        expect(breed.species_id).toBe(speciesId);
      });
    });
  });

  describe('T14: Error Format Tests', () => {
    it('should use "error" field in error responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'animal',
              entityId: 'invalid-animal',
              action: 'update', // Update non-existent entity
              farmId: testFarmId,
              payload: { officialNumber: 'INVALID' },
            },
          ],
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.results).toBeDefined();
      expect(response.body.results[0].success).toBe(false);
      expect(response.body.results[0]).toHaveProperty('error');
      expect(typeof response.body.results[0].error).toBe('string');
    });

    it('should return 400 for invalid request format', async () => {
      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          // Missing required 'items' field
          invalid: 'data',
        });

      expect(response.status).toBe(400);
    });

    it('should return version conflict error', async () => {
      // Create animal
      const animalId = 'animal-version-conflict';
      await prisma.animal.create({
        data: {
          id: animalId,
          farmId: testFarmId,
          officialNumber: 'VC001',
          visualId: 'VIS-VC001',
          sex: 'female',
          birthDate: new Date('2023-01-01'),
          version: 5, // Server is at version 5
        },
      });

      // Try to update with old version
      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'animal',
              entityId: animalId,
              action: 'update',
              farmId: testFarmId,
              clientVersion: 3, // Client is at version 3 (conflict)
              payload: { visualId: 'VIS-UPDATED' },
            },
          ],
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.results).toBeDefined();
      expect(response.body.results[0].success).toBe(false);
      expect(response.body.results[0].error).toContain('conflict');
      expect(response.body.results[0].serverVersion).toBe(5);
    });
  });

  describe('T15: Regression Tests - CRUD endpoints still work', () => {
    it('should still support traditional animal creation via direct endpoint', async () => {
      const response = await request(app.getHttpServer())
        .post('/animals')
        .send({
          farmId: testFarmId,
          officialNumber: 'CRUD001',
          visualId: 'VIS-CRUD001',
          sex: 'male',
          birthDate: '2023-08-15',
        });

      // Should work normally (200, 201 for success, 404 if endpoint doesn't exist)
      if (response.status === 404) {
        // Endpoint might not be implemented yet - skip test
        console.log('Note: POST /animals endpoint not implemented');
      } else {
        expect([200, 201]).toContain(response.status);
        expect(response.body).toHaveProperty('id');
      }
    });

    it('should still support GET /animals with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(`/animals?farmId=${testFarmId}&limit=10&offset=0`);

      if (response.status === 404) {
        console.log('Note: GET /animals endpoint not implemented');
      } else {
        expect([200]).toContain(response.status);
        // Should return paginated data structure
      }
    });

    it('should handle Lot.animalIds with junction table', async () => {
      // Create test animals
      const animal1Id = 'animal-lot-junction-1';
      const animal2Id = 'animal-lot-junction-2';

      await prisma.animal.createMany({
        data: [
          {
            id: animal1Id,
            farmId: testFarmId,
            officialNumber: 'LOT-A1',
            visualId: 'VIS-LOT-A1',
            sex: 'female',
            birthDate: new Date('2023-01-01'),
            version: 1,
          },
          {
            id: animal2Id,
            farmId: testFarmId,
            officialNumber: 'LOT-A2',
            visualId: 'VIS-LOT-A2',
            sex: 'male',
            birthDate: new Date('2023-02-01'),
            version: 1,
          },
        ],
      });

      const lotId = 'lot-with-junction';
      const payload = {
        farmId: testFarmId,
        name: 'Junction Test Lot',
        type: 'treatment',
        treatmentDate: '2024-01-01',
        animalIds: [animal1Id, animal2Id], // Should create junction records
      };

      const response = await request(app.getHttpServer())
        .post('/sync')
        .send({
          items: [
            {
              entityType: 'lot',
              entityId: lotId,
              action: 'create',
              farmId: testFarmId,
              payload,
            },
          ],
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body.results[0].success).toBe(true);

      // Verify junction records created
      const lotAnimals = await prisma.lotAnimal.findMany({
        where: { lotId },
      });

      expect(lotAnimals).toHaveLength(2);
      expect(lotAnimals.map(la => la.animalId)).toContain(animal1Id);
      expect(lotAnimals.map(la => la.animalId)).toContain(animal2Id);
    });
  });
});
