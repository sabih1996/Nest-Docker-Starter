import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './index.export';
@Entity()
@Unique(['country_name'])
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  country_name: string;

  @Column({ type: 'varchar', nullable: true })
  countryCode: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  currency: string;

  @Column({ type: 'varchar', nullable: true })
  currencySymbol: string;

  @Column({ type: 'boolean', default: false })
  public status: boolean;

  // Tax percentage to apply country wide
  @Column({ type: 'int', default: 0 })
  public tax: number;

  @OneToMany(() => User, (profile) => profile.roles)
  user: User[];

  @ManyToMany(() => User, (profile) => profile.naylamDispatcherCountries)
  naylamDispatchers: User[];
}
