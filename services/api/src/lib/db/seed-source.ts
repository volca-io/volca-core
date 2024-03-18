import { Knex } from 'knex';
import seeds from './seeds';

export class SeedSource implements Knex.SeedSource<Knex.Seed> {
  getSeeds(): Promise<Array<Knex.Seed>> {
    return Promise.resolve(seeds);
  }

  getSeed(seed: Knex.Seed): Promise<Knex.Seed> {
    return Promise.resolve(seed);
  }
}
