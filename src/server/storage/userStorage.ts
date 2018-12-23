import * as LRU from 'lru-cache';
import { User } from '../entities/user';

export const userStorage = new LRU<string, User>();
