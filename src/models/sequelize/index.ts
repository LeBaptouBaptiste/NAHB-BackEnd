// src/models/sequelize/index.ts
import { sequelize } from '../../config/mysql';

import User from './User';
import { UserRole } from './UserRole';
import Role from './Role';
import Story from './Story';
import Page from './Page';
import Choice from './Choice';
import Ending from './Ending';
import Rarity from './Rarity';
import Play from './Play';
import Comment from './Comment';
import Rating from './Rating';
import Report from './Report';

// Fonction d'initialisation des associations
export const initAssociations = () => {
  // ---------- Users & Roles ----------
  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles',
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'roleId',
    otherKey: 'userId',
    as: 'users',
  });

  User.hasMany(UserRole, { foreignKey: 'userId', as: 'userRoles' });
  UserRole.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Role.hasMany(UserRole, { foreignKey: 'roleId', as: 'roleLinks' });
  UserRole.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

  // ---------- User & Story ----------
  User.hasMany(Story, {
    foreignKey: 'authorId',
    as: 'stories',
  });

  Story.belongsTo(User, {
    foreignKey: 'authorId',
    as: 'author',
  });

  // ---------- Story & Page ----------
  Story.hasMany(Page, {
    foreignKey: 'storyId',
    as: 'pages',
  });

  Page.belongsTo(Story, {
    foreignKey: 'storyId',
    as: 'story',
  });

  // ---------- Page & Choice ----------
  Page.hasMany(Choice, {
    foreignKey: 'pageId',
    as: 'choices',
  });

  Choice.belongsTo(Page, {
    foreignKey: 'pageId',
    as: 'page',
  });

  // ---------- Story & Ending ----------
  Story.hasMany(Ending, {
    foreignKey: 'storyId',
    as: 'endings',
  });

  Ending.belongsTo(Story, {
    foreignKey: 'storyId',
    as: 'story',
  });

  // ---------- Page & Ending (0..1) ----------
  Page.hasOne(Ending, {
    foreignKey: 'pageId',
    as: 'ending',
  });

  Ending.belongsTo(Page, {
    foreignKey: 'pageId',
    as: 'page',
  });

  // ---------- Rarity & Ending ----------
  Rarity.hasMany(Ending, {
    foreignKey: 'rarityId',
    as: 'endings',
  });

  Ending.belongsTo(Rarity, {
    foreignKey: 'rarityId',
    as: 'rarity',
  });

  // ---------- Play ----------
  User.hasMany(Play, {
    foreignKey: 'userId',
    as: 'plays',
  });

  Play.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  Story.hasMany(Play, {
    foreignKey: 'storyId',
    as: 'plays',
  });

  Play.belongsTo(Story, {
    foreignKey: 'storyId',
    as: 'story',
  });

  // ---------- Comment ----------
  User.hasMany(Comment, {
    foreignKey: 'userId',
    as: 'comments',
  });

  Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  Story.hasMany(Comment, {
    foreignKey: 'storyId',
    as: 'comments',
  });

  Comment.belongsTo(Story, {
    foreignKey: 'storyId',
    as: 'story',
  });

  // deletedBy relation
  User.hasMany(Comment, {
    foreignKey: 'deletedByUserId',
    as: 'deletedComments',
  });

  Comment.belongsTo(User, {
    foreignKey: 'deletedByUserId',
    as: 'deletedBy',
  });

  // ---------- Rating ----------
  User.hasMany(Rating, {
    foreignKey: 'userId',
    as: 'ratings',
  });

  Rating.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  Story.hasMany(Rating, {
    foreignKey: 'storyId',
    as: 'ratings',
  });

  Rating.belongsTo(Story, {
    foreignKey: 'storyId',
    as: 'story',
  });

  // ---------- Report ----------
  User.hasMany(Report, {
    foreignKey: 'userId',
    as: 'reports',
  });

  Report.belongsTo(User, {
    foreignKey: 'userId',
    as: 'reporter',
  });

  Story.hasMany(Report, {
    foreignKey: 'storyId',
    as: 'reports',
  });

  Report.belongsTo(Story, {
    foreignKey: 'storyId',
    as: 'story',
  });
};

export {
  sequelize,
  User,
  UserRole,
  Role,
  Story,
  Page,
  Choice,
  Ending,
  Rarity,
  Play,
  Comment,
  Rating,
  Report,
};
