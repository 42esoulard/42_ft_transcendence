import { Users } from 'src/users/entity/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { GameUser } from './gameUser.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true, default: 'classic' })
  gameMode: string;

  @Column({ type: 'int', nullable: true })
  score1: number;

  @Column({ type: 'int', nullable: true })
  score2: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  startedAt: Date;

  @OneToMany(() => GameUser, (gameuser) => gameuser.game, {
    onDelete: 'CASCADE',
    eager: true,
  })
  users: GameUser[];

  // @ManyToMany(() => Users, user => user.games)
  // participants: Users[]
}
