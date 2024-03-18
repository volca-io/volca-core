import migrations, { Migration } from './migrations';

export class MigrationSource {
  getMigrations(): Promise<Array<Migration>> {
    return Promise.resolve(migrations);
  }

  getMigrationName(migration: Migration): string {
    return migration.name;
  }

  getMigration(migration: Migration): Promise<Migration> {
    return Promise.resolve(migration);
  }
}
