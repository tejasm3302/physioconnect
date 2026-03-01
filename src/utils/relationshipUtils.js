import {
  RELATIONSHIP_DURATION_DAYS,
  RELATIONSHIP_REMINDER_DAYS,
  RELATIONSHIP_STATUS
} from '../config/constants';

export function calculateRelationshipExpiry(startDate = new Date()) {
  const start = new Date(startDate);
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + RELATIONSHIP_DURATION_DAYS);
  return expiry.toISOString();
}

export function getRelationshipStatus(relationship) {
  if (!relationship?.expiresAt) {
    return RELATIONSHIP_STATUS.EXPIRED;
  }
  const now = new Date();
  const expiry = new Date(relationship.expiresAt);
  return expiry > now ? RELATIONSHIP_STATUS.ACTIVE : RELATIONSHIP_STATUS.EXPIRED;
}

export function withResolvedStatus(relationship) {
  const status = getRelationshipStatus(relationship);
  return { ...relationship, status };
}

export function isRelationshipActive(relationship) {
  return getRelationshipStatus(relationship) === RELATIONSHIP_STATUS.ACTIVE;
}

export function daysUntilExpiry(relationship) {
  if (!relationship?.expiresAt) return 0;
  const now = new Date();
  const expiry = new Date(relationship.expiresAt);
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
}

export function isNearExpiry(relationship) {
  const remaining = daysUntilExpiry(relationship);
  return remaining > 0 && remaining <= RELATIONSHIP_REMINDER_DAYS;
}

export function makeRelationship(customerId, therapistId, existingId = null) {
  const createdAt = new Date().toISOString();
  return {
    id: existingId,
    customerId,
    therapistId,
    createdAt,
    expiresAt: calculateRelationshipExpiry(createdAt),
    status: RELATIONSHIP_STATUS.ACTIVE
  };
}
