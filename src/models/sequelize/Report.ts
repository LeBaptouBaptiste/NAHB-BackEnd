import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/mysql';

type ReportType = 'inappropriate_content' | 'spam' | 'copyright' | 'harassment' | 'other';
type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

interface ReportAttributes {
  id: number;
  storyId: number;
  userId: number;
  type: ReportType;
  description?: string;
  status: ReportStatus;
  resolvedBy?: number;
}

type ReportCreation = Optional<ReportAttributes, 'id' | 'description' | 'status' | 'resolvedBy'>;

export class Report extends Model<ReportAttributes, ReportCreation> {}

Report.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    storyId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
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
    resolvedBy: { type: DataTypes.INTEGER.UNSIGNED },
  },
  { tableName: 'reports', sequelize }
);

export default Report;
