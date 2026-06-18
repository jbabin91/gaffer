import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// Text + numbers only — no crests, photos, or EA branding (licensed likeness).
// See docs/decisions/0007, 0012.
export const playerCatalog = pgTable(
  'player_catalog',
  {
    age: integer('age'),
    clubName: text('club_name'),
    defending: integer('defending'),
    dribbling: integer('dribbling'),
    fullName: text('full_name').notNull(),
    id: integer('id').primaryKey(),
    nationality: text('nationality'),
    overall: integer('overall'),
    pace: integer('pace'),
    passing: integer('passing'),
    physical: integer('physical'),
    positions: text('positions'),
    potential: integer('potential'),
    primaryPosition: text('primary_position'),
    shooting: integer('shooting'),
    valueEur: integer('value_eur'),
    wageEur: integer('wage_eur'),
  },
  (t) => [index('catalog_name_idx').on(t.fullName)],
);

export const careers = pgTable('careers', {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  managerName: text('manager_name'),
  name: text('name').notNull(),
});

export const seasons = pgTable(
  'seasons',
  {
    careerId: text('career_id')
      .notNull()
      .references(() => careers.id, { onDelete: 'cascade' }),
    clubName: text('club_name'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    finalPosition: integer('final_position'),
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    isCurrent: boolean('is_current').notNull().default(false),
    label: text('label').notNull(),
    league: text('league'),
    startYear: integer('start_year'),
  },
  (t) => [
    index('seasons_career_idx').on(t.careerId),
    uniqueIndex('seasons_one_current_per_career_idx')
      .on(t.careerId)
      .where(sql`${t.isCurrent}`),
  ],
);

export const players = pgTable(
  'players',
  {
    age: integer('age'),
    careerId: text('career_id')
      .notNull()
      .references(() => careers.id, { onDelete: 'cascade' }),
    catalogId: integer('catalog_id').references(() => playerCatalog.id),
    contractUntil: integer('contract_until'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    marketValueEur: integer('market_value_eur'),
    name: text('name').notNull(),
    nationality: text('nationality'),
    onSquad: boolean('on_squad').notNull().default(true),
    // Denormalized "current" values for fast lists; history lives in snapshots.
    overall: integer('overall'),
    potential: integer('potential'),
    primaryPosition: text('primary_position'),
    secondaryPositions: text('secondary_positions'),
    squadNumber: integer('squad_number'),
    wageEur: integer('wage_eur'),
  },
  (t) => [index('players_career_idx').on(t.careerId)],
);

export const playerSnapshots = pgTable(
  'player_snapshots',
  {
    form: real('form'),
    id: text('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    inGameWeek: integer('in_game_week').notNull(),
    marketValueEur: integer('market_value_eur'),
    overall: integer('overall').notNull(),
    playerId: text('player_id')
      .notNull()
      .references(() => players.id, { onDelete: 'cascade' }),
    potential: integer('potential'),
    recordedAt: timestamp('recorded_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    seasonId: text('season_id').references(() => seasons.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [uniqueIndex('snapshot_player_week_idx').on(t.playerId, t.inGameWeek)],
);

// Role domain for the Better Auth admin plugin. `text({ enum })` is a TS-only
// narrowing (no DB constraint, so the plugin's multi-role CSV writes still pass):
// it makes a typo'd role literal a compile error, but a read role isn't exhaustive.
export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const ADMIN_ROLE: UserRole = 'admin';

// Better Auth tables. Field names mirror the required schema — regenerate with
// `@better-auth/cli generate` when auth plugins change. See decision 0013.
export const user = pgTable('user', {
  banExpires: timestamp({ withTimezone: true }),
  banned: boolean().default(false),
  banReason: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  id: text().primaryKey(),
  image: text(),
  name: text().notNull(),
  role: text({ enum: USER_ROLES }),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = pgTable(
  'session',
  {
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    id: text().primaryKey(),
    impersonatedBy: text(),
    ipAddress: text(),
    token: text().notNull().unique(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [index('session_user_idx').on(t.userId)],
);

export const account = pgTable(
  'account',
  {
    accessToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    accountId: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    id: text().primaryKey(),
    idToken: text(),
    password: text(),
    providerId: text().notNull(),
    refreshToken: text(),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [index('account_user_idx').on(t.userId)],
);

export const verification = pgTable(
  'verification',
  {
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    id: text().primaryKey(),
    identifier: text().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    value: text().notNull(),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
);

// Codes stored as SHA-256 hashes; shape mirrors better-auth-invitation-only's declared schema.
export const invitation = pgTable(
  'invitation',
  {
    codeHash: text().notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    email: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    id: text().primaryKey(),
    invitedBy: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    maxUses: integer().notNull().default(1),
    metadata: text(),
    revokedAt: timestamp({ withTimezone: true }),
    useCount: integer().notNull().default(0),
    usedAt: timestamp({ withTimezone: true }),
    // Set-null on user delete: usedBy can be null while usedAt is set, so a null
    // usedBy doesn't mean unused.
    usedBy: text().references(() => user.id, { onDelete: 'set null' }),
  },
  (t) => [
    index('invitation_email_idx').on(t.email),
    index('invitation_expires_at_idx').on(t.expiresAt),
    index('invitation_created_at_idx').on(t.createdAt),
  ],
);

// Pending validate→signup bridge entries (5-min TTL). `key` is a SHA-256 hash of
// the plugin's pending-entry key (signup email, or the raw code on OAuth), so no
// bearer code or email is stored in plaintext.
export const invitePending = pgTable('invite_pending', {
  // No defaultNow(): createInviteStore is the sole writer and stores the plugin's
  // entry timestamp (what the TTL sweep keys on), not insert time.
  createdAt: timestamp({ withTimezone: true }).notNull(),
  invitationId: text()
    .notNull()
    .references(() => invitation.id, { onDelete: 'cascade' }),
  key: text().primaryKey(),
});

export const careersRelations = relations(careers, ({ many }) => ({
  players: many(players),
  seasons: many(seasons),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const seasonsRelations = relations(seasons, ({ one }) => ({
  career: one(careers, {
    fields: [seasons.careerId],
    references: [careers.id],
  }),
}));

export const playersRelations = relations(players, ({ many, one }) => ({
  career: one(careers, {
    fields: [players.careerId],
    references: [careers.id],
  }),
  catalog: one(playerCatalog, {
    fields: [players.catalogId],
    references: [playerCatalog.id],
  }),
  snapshots: many(playerSnapshots),
}));

export const playerSnapshotsRelations = relations(
  playerSnapshots,
  ({ one }) => ({
    player: one(players, {
      fields: [playerSnapshots.playerId],
      references: [players.id],
    }),
  }),
);

export type Career = typeof careers.$inferSelect;
export type NewCareer = typeof careers.$inferInsert;
export type Season = typeof seasons.$inferSelect;
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type PlayerSnapshot = typeof playerSnapshots.$inferSelect;
export type NewPlayerSnapshot = typeof playerSnapshots.$inferInsert;
export type CatalogPlayer = typeof playerCatalog.$inferSelect;
