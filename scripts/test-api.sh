#!/bin/bash

# =============================================================================
# AniTra API Test Script
# =============================================================================

BASE_URL="${BASE_URL:-http://localhost:3000}"
TOKEN="${TOKEN:-test-token}"

# Default farm ID from AuthGuard dev mode
FARM_ID="550e8400-e29b-41d4-a716-446655440000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
  echo ""
  echo -e "${BLUE}============================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}============================================${NC}"
}

print_test() {
  echo -e "${YELLOW}► $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Generic API call function
api_call() {
  local method=$1
  local endpoint=$2
  local data=$3

  if [ -n "$data" ]; then
    curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$data"
  else
    curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN"
  fi
}

# =============================================================================
# Health Check
# =============================================================================
print_header "Health Check"

print_test "GET /"
RESPONSE=$(curl -s "$BASE_URL")
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# =============================================================================
# Veterinarians (Reference Table)
# =============================================================================
print_header "Veterinarians API"

# Create
print_test "POST /veterinarians - Create"
VET_RESPONSE=$(api_call POST "/veterinarians" '{
  "name": "Dr. Ahmed Benali",
  "phone": "0551234567",
  "email": "ahmed.benali@vet.dz",
  "licenseNumber": "VET-2024-001",
  "specialization": "Ruminants"
}')
echo "$VET_RESPONSE" | jq . 2>/dev/null || echo "$VET_RESPONSE"
VET_ID=$(echo "$VET_RESPONSE" | jq -r '.data.id // .id // empty')
echo ""

# List
print_test "GET /veterinarians - List all"
api_call GET "/veterinarians" | jq . 2>/dev/null
echo ""

# Get one
if [ -n "$VET_ID" ]; then
  print_test "GET /veterinarians/$VET_ID - Get one"
  api_call GET "/veterinarians/$VET_ID" | jq . 2>/dev/null
  echo ""

  # Update
  print_test "PUT /veterinarians/$VET_ID - Update"
  api_call PUT "/veterinarians/$VET_ID" '{
    "phone": "0559876543"
  }' | jq . 2>/dev/null
  echo ""
fi

# =============================================================================
# Medical Products (Reference Table)
# =============================================================================
print_header "Medical Products API"

print_test "POST /medical-products - Create"
PRODUCT_RESPONSE=$(api_call POST "/medical-products" '{
  "name": "Ivermectine 1%",
  "activeSubstance": "Ivermectine",
  "manufacturer": "MSD Animal Health",
  "withdrawalPeriodMeat": 28,
  "withdrawalPeriodMilk": 0,
  "dosageUnit": "ml"
}')
echo "$PRODUCT_RESPONSE" | jq . 2>/dev/null || echo "$PRODUCT_RESPONSE"
PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | jq -r '.data.id // .id // empty')
echo ""

print_test "GET /medical-products - List all"
api_call GET "/medical-products" | jq . 2>/dev/null
echo ""

# =============================================================================
# Vaccines (Reference Table)
# =============================================================================
print_header "Vaccines API"

print_test "POST /vaccines - Create"
VACCINE_RESPONSE=$(api_call POST "/vaccines" '{
  "name": "Enterotoxémie",
  "disease": "Entérotoxémie",
  "manufacturer": "INMV Algérie",
  "dosagePerAnimal": 2,
  "dosageUnit": "ml",
  "boosterRequired": true,
  "boosterIntervalDays": 21
}')
echo "$VACCINE_RESPONSE" | jq . 2>/dev/null || echo "$VACCINE_RESPONSE"
VACCINE_ID=$(echo "$VACCINE_RESPONSE" | jq -r '.data.id // .id // empty')
echo ""

print_test "GET /vaccines - List all"
api_call GET "/vaccines" | jq . 2>/dev/null
echo ""

# =============================================================================
# Administration Routes (Reference Table)
# =============================================================================
print_header "Administration Routes API"

print_test "POST /administration-routes - Create IM"
api_call POST "/administration-routes" '{
  "id": "IM",
  "nameFr": "Intramusculaire",
  "nameEn": "Intramuscular",
  "nameAr": "عضلي",
  "displayOrder": 1
}' | jq . 2>/dev/null
echo ""

print_test "POST /administration-routes - Create SC"
api_call POST "/administration-routes" '{
  "id": "SC",
  "nameFr": "Sous-cutanée",
  "nameEn": "Subcutaneous",
  "nameAr": "تحت الجلد",
  "displayOrder": 2
}' | jq . 2>/dev/null
echo ""

print_test "POST /administration-routes - Create PO"
api_call POST "/administration-routes" '{
  "id": "PO",
  "nameFr": "Orale",
  "nameEn": "Oral",
  "nameAr": "فموي",
  "displayOrder": 3
}' | jq . 2>/dev/null
echo ""

print_test "GET /administration-routes - List all"
api_call GET "/administration-routes" | jq . 2>/dev/null
echo ""

# =============================================================================
# Animals API
# =============================================================================
print_header "Animals API"

print_test "POST /animals - Create"
ANIMAL_RESPONSE=$(api_call POST "/animals" "{
  \"identifier\": \"OV-2024-001\",
  \"name\": \"Bella\",
  \"speciesId\": \"sheep\",
  \"breedId\": \"ouled-djellal\",
  \"sex\": \"female\",
  \"birthDate\": \"2023-01-15\",
  \"status\": \"active\",
  \"farmId\": \"$FARM_ID\"
}")
echo "$ANIMAL_RESPONSE" | jq . 2>/dev/null || echo "$ANIMAL_RESPONSE"
ANIMAL_ID=$(echo "$ANIMAL_RESPONSE" | jq -r '.data.id // .id // empty')
echo ""

print_test "GET /animals - List all"
api_call GET "/animals?farmId=$FARM_ID" | jq . 2>/dev/null
echo ""

# =============================================================================
# Lots API
# =============================================================================
print_header "Lots API"

print_test "POST /lots - Create"
LOT_RESPONSE=$(api_call POST "/lots" "{
  \"name\": \"Lot Engraissement 2024\",
  \"lotType\": \"fattening\",
  \"farmId\": \"$FARM_ID\"
}")
echo "$LOT_RESPONSE" | jq . 2>/dev/null || echo "$LOT_RESPONSE"
LOT_ID=$(echo "$LOT_RESPONSE" | jq -r '.data.id // .id // empty')
echo ""

# Add animal to lot
if [ -n "$LOT_ID" ] && [ -n "$ANIMAL_ID" ]; then
  print_test "POST /lots/$LOT_ID/animals - Add animal"
  api_call POST "/lots/$LOT_ID/animals" "{
    \"animalIds\": [\"$ANIMAL_ID\"]
  }" | jq . 2>/dev/null
  echo ""
fi

# =============================================================================
# Weights API
# =============================================================================
print_header "Weights API"

if [ -n "$ANIMAL_ID" ]; then
  print_test "POST /weights - Create weight record"
  api_call POST "/weights" "{
    \"animalId\": \"$ANIMAL_ID\",
    \"weight\": 45.5,
    \"measurementDate\": \"2024-01-15\",
    \"farmId\": \"$FARM_ID\"
  }" | jq . 2>/dev/null
  echo ""

  print_test "POST /weights - Create second weight"
  api_call POST "/weights" "{
    \"animalId\": \"$ANIMAL_ID\",
    \"weight\": 52.3,
    \"measurementDate\": \"2024-02-15\",
    \"farmId\": \"$FARM_ID\"
  }" | jq . 2>/dev/null
  echo ""

  print_test "GET /weights - List with daily gain"
  api_call GET "/weights?farmId=$FARM_ID&animalId=$ANIMAL_ID" | jq . 2>/dev/null
  echo ""
fi

# =============================================================================
# Treatments API
# =============================================================================
print_header "Treatments API"

if [ -n "$ANIMAL_ID" ]; then
  print_test "POST /treatments - Create"
  api_call POST "/treatments" "{
    \"animalId\": \"$ANIMAL_ID\",
    \"treatmentDate\": \"2024-01-20\",
    \"reason\": \"Parasitisme interne\",
    \"diagnosis\": \"Strongylose digestive\",
    \"dosage\": 5,
    \"farmId\": \"$FARM_ID\"
  }" | jq . 2>/dev/null
  echo ""
fi

# =============================================================================
# Vaccinations API
# =============================================================================
print_header "Vaccinations API"

if [ -n "$ANIMAL_ID" ]; then
  print_test "POST /vaccinations - Create"
  api_call POST "/vaccinations" "{
    \"animalId\": \"$ANIMAL_ID\",
    \"vaccinationDate\": \"2024-01-25\",
    \"nextDueDate\": \"2024-07-25\",
    \"farmId\": \"$FARM_ID\"
  }" | jq . 2>/dev/null
  echo ""
fi

# =============================================================================
# Movements API
# =============================================================================
print_header "Movements API"

if [ -n "$ANIMAL_ID" ]; then
  print_test "POST /movements - Create entry"
  api_call POST "/movements" "{
    \"animalId\": \"$ANIMAL_ID\",
    \"movementType\": \"entry\",
    \"movementDate\": \"2024-01-01\",
    \"origin\": \"Marché Djelfa\",
    \"farmId\": \"$FARM_ID\"
  }" | jq . 2>/dev/null
  echo ""

  print_test "GET /movements/statistics - Stats"
  api_call GET "/movements/statistics?farmId=$FARM_ID" | jq . 2>/dev/null
  echo ""
fi

# =============================================================================
# Breedings API
# =============================================================================
print_header "Breedings API"

if [ -n "$ANIMAL_ID" ]; then
  print_test "POST /breedings - Create"
  api_call POST "/breedings" "{
    \"femaleId\": \"$ANIMAL_ID\",
    \"breedingDate\": \"2024-02-01\",
    \"method\": \"natural\",
    \"farmId\": \"$FARM_ID\"
  }" | jq . 2>/dev/null
  echo ""

  print_test "GET /breedings/upcoming - Upcoming due dates"
  api_call GET "/breedings/upcoming?farmId=$FARM_ID" | jq . 2>/dev/null
  echo ""
fi

# =============================================================================
# Campaigns API
# =============================================================================
print_header "Campaigns API"

print_test "POST /campaigns - Create vaccination campaign"
CAMPAIGN_RESPONSE=$(api_call POST "/campaigns" "{
  \"name\": \"Campagne Enterotoxémie 2024\",
  \"campaignType\": \"vaccination\",
  \"startDate\": \"2024-03-01\",
  \"endDate\": \"2024-03-15\",
  \"targetCount\": 100,
  \"farmId\": \"$FARM_ID\"
}")
echo "$CAMPAIGN_RESPONSE" | jq . 2>/dev/null || echo "$CAMPAIGN_RESPONSE"
CAMPAIGN_ID=$(echo "$CAMPAIGN_RESPONSE" | jq -r '.data.id // .id // empty')
echo ""

if [ -n "$CAMPAIGN_ID" ]; then
  print_test "GET /campaigns/$CAMPAIGN_ID/progress - Progress"
  api_call GET "/campaigns/$CAMPAIGN_ID/progress" | jq . 2>/dev/null
  echo ""
fi

# =============================================================================
# Documents API
# =============================================================================
print_header "Documents API"

print_test "POST /documents - Create health certificate"
api_call POST "/documents" "{
  \"documentType\": \"health_certificate\",
  \"documentNumber\": \"CERT-2024-001\",
  \"issueDate\": \"2024-01-15\",
  \"expiryDate\": \"2024-07-15\",
  \"issuingAuthority\": \"DSA Djelfa\",
  \"farmId\": \"$FARM_ID\"
}" | jq . 2>/dev/null
echo ""

print_test "GET /documents/expiring - Expiring soon"
api_call GET "/documents/expiring?farmId=$FARM_ID&days=180" | jq . 2>/dev/null
echo ""

# =============================================================================
# Rate Limiting Test
# =============================================================================
print_header "Rate Limiting Test"

print_test "Testing rate limit (5 rapid requests)..."
for i in {1..5}; do
  RESPONSE=$(api_call GET "/veterinarians")
  STATUS=$(echo "$RESPONSE" | jq -r '.success // "error"')
  if [ "$STATUS" = "false" ]; then
    print_error "Request $i: Rate limited"
  else
    print_success "Request $i: OK"
  fi
done
echo ""

# =============================================================================
# Sync API
# =============================================================================
print_header "Sync API"

print_test "GET /sync/changes - Get changes since timestamp"
api_call GET "/sync/changes?farmId=$FARM_ID&since=2024-01-01T00:00:00Z" | jq . 2>/dev/null
echo ""

# =============================================================================
# Cleanup (optional)
# =============================================================================
print_header "Test Complete"

echo ""
echo "Created resources:"
[ -n "$VET_ID" ] && echo "  - Veterinarian: $VET_ID"
[ -n "$PRODUCT_ID" ] && echo "  - Medical Product: $PRODUCT_ID"
[ -n "$VACCINE_ID" ] && echo "  - Vaccine: $VACCINE_ID"
[ -n "$ANIMAL_ID" ] && echo "  - Animal: $ANIMAL_ID"
[ -n "$LOT_ID" ] && echo "  - Lot: $LOT_ID"
[ -n "$CAMPAIGN_ID" ] && echo "  - Campaign: $CAMPAIGN_ID"
echo ""
echo "To delete test data, use DELETE endpoints with the IDs above."
echo ""
