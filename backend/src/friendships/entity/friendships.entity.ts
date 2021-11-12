import { Users } from 'src/users/entity/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('friendships')
export class Friendships {
  @PrimaryGeneratedColumn()
	  id: number

  @ManyToOne(() => Users, (requester) => requester.friendships_requested, {
    onDelete: 'CASCADE',
    eager: true,
  })
  requester: Users;

  @ManyToOne(() => Users, (adressee) => adressee.friendships_adressed, {
    onDelete: 'CASCADE',
    eager: true,
  })
  adressee: Users;

  @Column({ default: true })
  pending: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;
}
