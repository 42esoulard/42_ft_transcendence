import { Users } from 'src/users/entity/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('relationships')
export class Relationships {
  @PrimaryGeneratedColumn()
	  id: number

  @ManyToOne(() => Users, (requester) => requester.relationships_requested, {
    onDelete: 'CASCADE',
    eager: true,
  })
  requester: Users;

  @ManyToOne(() => Users, (adressee) => adressee.relationships_adressed, {
    onDelete: 'CASCADE',
    eager: true,
  })
  adressee: Users;

  @Column({ default: true })
  pending: boolean;

  @Column({ default: 'friendship' })
  nature: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;
}
