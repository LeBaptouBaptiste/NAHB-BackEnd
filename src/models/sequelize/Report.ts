import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

type ReportType = 'inappropriate_content' | 'spam' | 'copyright' | 'harassment' | 'other';
type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

interface ReportAttributes {
  id: number;
  storyId: string;
  userId: number;
  type: ReportType;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  resolvedBy?: number;
}

type ReportCreation = Optional<ReportAttributes, 'id' | 'description' | 'status' | 'adminNotes' | 'resolvedBy'>;

export class Report extends Model<ReportAttributes, ReportCreation> implements ReportAttributes {
  declare id: number;
  declare storyId: string;
  declare userId: number;
  declare type: ReportType;
  declare description?: string;
  declare status: ReportStatus;
  declare adminNotes?: string;
  declare resolvedBy?: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Report.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    storyId: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    type: {
      type: DataTypes.ENUM('inappropriate_content', 'spam', 'copyright', 'harassment', 'other'),
      allowNull: false,
    },
    description: { type: DataTypes.STRING(1000) },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
      defaultValue: 'pending',
    },
    adminNotes: { type: DataTypes.STRING(1000) },
    resolvedBy: { type: DataTypes.INTEGER.UNSIGNED },
  },
  { tableName: 'reports', sequelize }
);

export default Report;
