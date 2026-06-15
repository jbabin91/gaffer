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

export const careersRelations = relations(careers, ({ many }) => ({
  players: many(players),
  seasons: many(seasons),
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
