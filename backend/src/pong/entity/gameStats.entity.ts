import { Users } from 'src/users/entity/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('gameStats')
export class GameStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  ladderLevel: number;

  @OneToOne(() => Users, (user) => user.gameStats, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
