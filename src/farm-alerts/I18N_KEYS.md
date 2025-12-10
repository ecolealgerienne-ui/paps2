# Farm Alerts - I18N Keys

> Document de référence pour les clés de traduction du module Farm Alerts
> Total: 45+ clés

---

## Error Messages (6)

| Key | Description |
|-----|-------------|
| `errors.farm_alert_not_found` | Alerte introuvable |
| `errors.farm_alert_already_read` | Alerte déjà lue |
| `errors.farm_alert_already_dismissed` | Alerte déjà ignorée |
| `errors.farm_alert_already_resolved` | Alerte déjà résolue |
| `errors.farm_alert_invalid_status_transition` | Transition de statut invalide |
| `errors.farm_alert_generation_failed` | Échec de génération des alertes |

---

## Validation Errors (4)

| Key | Description |
|-----|-------------|
| `validation.alert_id_required` | ID d'alerte requis |
| `validation.status_required` | Statut requis |
| `validation.read_on_required_for_read_status` | Plateforme requise pour statut "lu" |
| `validation.invalid_alert_status` | Statut d'alerte invalide |

---

## Success Messages (5)

| Key | Description |
|-----|-------------|
| `success.alert_status_updated` | Statut de l'alerte mis à jour |
| `success.alerts_marked_as_read` | Alertes marquées comme lues |
| `success.alert_dismissed` | Alerte ignorée |
| `success.alert_deleted` | Alerte supprimée |
| `success.alerts_generated` | Alertes générées avec succès |

---

## Alert Status Labels (4)

| Key | FR | EN | AR |
|-----|----|----|-----|
| `status.pending` | En attente | Pending | قيد الانتظار |
| `status.read` | Lue | Read | مقروءة |
| `status.dismissed` | Ignorée | Dismissed | تم تجاهلها |
| `status.resolved` | Résolue | Resolved | تم حلها |

---

## Alert Titles by Code (18)

### Vaccination
| Key | FR | EN | AR |
|-----|----|----|-----|
| `alerts.vacc_due.title` | Vaccination à venir | Vaccination Due | تطعيم مستحق |
| `alerts.vacc_overdue.title` | Vaccination en retard | Vaccination Overdue | تطعيم متأخر |
| `alerts.vacc_annual_due.title` | Rappel annuel à venir | Annual Booster Due | تذكير سنوي مستحق |

### Treatment
| Key | FR | EN | AR |
|-----|----|----|-----|
| `alerts.treatment_ending.title` | Traitement se termine | Treatment Ending | العلاج ينتهي |
| `alerts.treatment_overdue.title` | Traitement en retard | Treatment Overdue | العلاج متأخر |
| `alerts.withdrawal_active.title` | Délai d'attente actif | Withdrawal Period Active | فترة السحب نشطة |
| `alerts.withdrawal_ending.title` | Fin de délai d'attente | Withdrawal Period Ending | فترة السحب تنتهي |

### Nutrition
| Key | FR | EN | AR |
|-----|----|----|-----|
| `alerts.weighing_due.title` | Pesée à effectuer | Weighing Due | الوزن مستحق |
| `alerts.gmq_low.title` | GMQ faible | Low ADG | معدل النمو منخفض |
| `alerts.gmq_critical.title` | GMQ critique | Critical ADG | معدل النمو حرج |
| `alerts.weight_loss.title` | Perte de poids | Weight Loss | فقدان الوزن |

### Reproduction
| Key | FR | EN | AR |
|-----|----|----|-----|
| `alerts.calving_soon.title` | Mise-bas imminente | Calving Soon | الولادة قريبة |
| `alerts.heat_expected.title` | Chaleurs attendues | Heat Expected | الشبق متوقع |
| `alerts.pregnancy_check.title` | Contrôle gestation | Pregnancy Check Due | فحص الحمل مستحق |

### Health
| Key | FR | EN | AR |
|-----|----|----|-----|
| `alerts.health_check_due.title` | Contrôle sanitaire | Health Check Due | الفحص الصحي مستحق |
| `alerts.quarantine_ending.title` | Fin de quarantaine | Quarantine Ending | الحجر الصحي ينتهي |

### Administrative
| Key | FR | EN | AR |
|-----|----|----|-----|
| `alerts.doc_expiring.title` | Document expire | Document Expiring | الوثيقة تنتهي |
| `alerts.id_missing.title` | Identification manquante | Missing Identification | الهوية مفقودة |

---

## Alert Messages by Code (18)

### Vaccination
| Key | Description |
|-----|-------------|
| `alerts.vacc_due.message` | La vaccination {vaccineName} est due dans {daysUntilDue} jours |
| `alerts.vacc_overdue.message` | La vaccination {vaccineName} est en retard de {daysOverdue} jours |
| `alerts.vacc_annual_due.message` | Le rappel annuel {vaccineName} est dû dans {daysUntilDue} jours |

### Treatment
| Key | Description |
|-----|-------------|
| `alerts.treatment_ending.message` | Le traitement {treatmentName} se termine dans {daysUntilEnd} jours |
| `alerts.treatment_overdue.message` | Le traitement {treatmentName} est en retard |
| `alerts.withdrawal_active.message` | Délai d'attente actif jusqu'au {withdrawalEndDate} |
| `alerts.withdrawal_ending.message` | Le délai d'attente se termine dans {daysUntilEnd} jours |

### Nutrition
| Key | Description |
|-----|-------------|
| `alerts.weighing_due.message` | Dernière pesée il y a {daysSinceLastWeighing} jours |
| `alerts.gmq_low.message` | GMQ de {gmq} g/j (seuil: {threshold} g/j) |
| `alerts.gmq_critical.message` | GMQ critique: {gmq} g/j |
| `alerts.weight_loss.message` | Perte de {weightLoss} kg depuis la dernière pesée |

### Reproduction
| Key | Description |
|-----|-------------|
| `alerts.calving_soon.message` | Mise-bas prévue dans {daysUntilDue} jours |
| `alerts.heat_expected.message` | Chaleurs attendues dans {daysUntilDue} jours |
| `alerts.pregnancy_check.message` | Contrôle de gestation à effectuer |

### Health
| Key | Description |
|-----|-------------|
| `alerts.health_check_due.message` | Contrôle sanitaire dû dans {daysUntilDue} jours |
| `alerts.quarantine_ending.message` | Quarantaine se termine dans {daysUntilEnd} jours |

### Administrative
| Key | Description |
|-----|-------------|
| `alerts.doc_expiring.message` | Le document {documentType} expire dans {daysUntilExpiry} jours |
| `alerts.id_missing.message` | L'animal n'a pas d'identification officielle |

---

## Categories Labels (6)

| Key | FR | EN | AR |
|-----|----|----|-----|
| `category.vaccination` | Vaccination | Vaccination | التطعيم |
| `category.treatment` | Traitement | Treatment | العلاج |
| `category.nutrition` | Nutrition | Nutrition | التغذية |
| `category.reproduction` | Reproduction | Reproduction | التكاثر |
| `category.health` | Santé | Health | الصحة |
| `category.administrative` | Administratif | Administrative | الإداري |

---

## Priority Labels (4)

| Key | FR | EN | AR |
|-----|----|----|-----|
| `priority.urgent` | Urgent | Urgent | عاجل |
| `priority.high` | Important | High | مهم |
| `priority.medium` | Moyen | Medium | متوسط |
| `priority.low` | Faible | Low | منخفض |

---

*Document généré le 2025-12-10*
