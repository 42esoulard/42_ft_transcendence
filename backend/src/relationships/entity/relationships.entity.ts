import { Users } from 'src/users/entity/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('relationships')
export class Relationships {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'number' })
  requesterId: number;

  @ManyToOne(() => Users, (requester) => requester.relationships_requested, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'requesterId' })
  requester: Users;

  @Column({ type: 'number' })
  adresseeId: number;

  @ManyToOne(() => Users, (adressee) => adressee.relationships_adressed, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'adresseeId' })
  adressee: Users;

  @Column({ default: true })
  pending: boolean;

  @Column({ default: 'friendship' })
  nature: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;
}
