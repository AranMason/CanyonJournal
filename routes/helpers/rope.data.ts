import { sql } from '../middleware/sqlserver';
import { ServiceHistoryData } from './gear.data';
import { toNullableDate, toNullableString } from './sql.helper';

// Should be a lower-casing of the RopeItem interface in /src/types/types.ts, but with Date types instead of strings for dates
export interface RopeItemData {
  name: string;
  diameter: number | null;
  length: number | null;
  unit: string;
  notes: string | null;
  isRetired: boolean;
  manufacturer: string | null;
  manufactureDate: Date | null;
  inServiceDate: Date | null;
  retirementDate: Date | null;
  serialNumber: string | null;
  model: string | null;
  weightGrams: number | null;
  parentRopeItemsId: number | null;
}

export const doesUserOwnRope = async (
  pool: sql.ConnectionPool,
  userId: number,
  ropeId: number
): Promise<boolean> => {
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('ropeId', sql.Int, ropeId)
    .query('SELECT Id FROM RopeItems WHERE Id = @ropeId AND UserId = @userId');

  return result.recordset.length > 0;
};

export const createRopeItem = async (
  pool: sql.ConnectionPool,
  userId: number,
  data: RopeItemData
): Promise<RopeItemData> => {
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('name', sql.NVarChar(200), data.name)
    .input('diameter', sql.Float, data.diameter)
    .input('length', sql.Float, data.length)
    .input('unit', sql.NVarChar(20), data.unit)
    .input('notes', sql.NVarChar(500), data.notes)
    .input('isRetired', sql.Bit, data.isRetired)
    .input('manufacturer', sql.NVarChar(255), data.manufacturer)
    .input('manufactureDate', sql.Date, toNullableDate(data.manufactureDate))
    .input('inServiceDate', sql.Date, toNullableDate(data.inServiceDate))
    .input('retirementDate', sql.Date, toNullableDate(data.retirementDate))
    .input('serialNumber', sql.NVarChar(255), data.serialNumber)
    .input('model', sql.NVarChar(255), data.model)
    .input('weightGrams', sql.Float, data.weightGrams)
    .input('parentRopeItemsId', sql.Int, data.parentRopeItemsId)
    .query(`
      INSERT INTO RopeItems (
        UserId,
        Name,
        Diameter,
        Length,
        Unit,
        Notes,
        IsRetired,
        Manufacturer,
        ManufactureDate,
        InServiceDate,
        RetirementDate,
        SerialNumber,
        Model,
        WeightGrams,
        ParentRopeItemsId,
        Created,
        Updated
      )
      OUTPUT INSERTED.*
      VALUES (
        @userId,
        @name,
        @diameter,
        @length,
        @unit,
        @notes,
        @isRetired,
        @manufacturer,
        @manufactureDate,
        @inServiceDate,
        @retirementDate,
        @serialNumber,
        @model,
        @weightGrams,
        @parentRopeItemsId,
        GETDATE(),
        GETDATE()
      )
    `);

  return result.recordset[0];
};

export const updateRopeItem = async (
  pool: sql.ConnectionPool,
  userId: number,
  ropeId: number,
  data: RopeItemData
): Promise<RopeItemData | undefined> => {
  const result = await pool.request()
    .input('id', sql.Int, ropeId)
    .input('userId', sql.Int, userId)
    .input('name', sql.NVarChar(200), data.name)
    .input('diameter', sql.Float, data.diameter)
    .input('length', sql.Float, data.length)
    .input('unit', sql.NVarChar(20), data.unit)
    .input('notes', sql.NVarChar(500), data.notes)
    .input('isRetired', sql.Bit, data.isRetired)
    .input('manufacturer', sql.NVarChar(255), data.manufacturer)
    .input('manufactureDate', sql.Date, toNullableDate(data.manufactureDate))
    .input('inServiceDate', sql.Date, toNullableDate(data.inServiceDate))
    .input('retirementDate', sql.Date, toNullableDate(data.retirementDate))
    .input('serialNumber', sql.NVarChar(255), data.serialNumber)
    .input('model', sql.NVarChar(255), data.model)
    .input('weightGrams', sql.Float, data.weightGrams)
    .input('parentRopeItemsId', sql.Int, data.parentRopeItemsId)
    .query(`
      UPDATE RopeItems SET
        Name = @name,
        Diameter = @diameter,
        Length = @length,
        Unit = @unit,
        Notes = @notes,
        IsRetired = @isRetired,
        Manufacturer = @manufacturer,
        ManufactureDate = @manufactureDate,
        InServiceDate = @inServiceDate,
        RetirementDate = @retirementDate,
        SerialNumber = @serialNumber,
        Model = @model,
        WeightGrams = @weightGrams,
        ParentRopeItemsId = @parentRopeItemsId,
        Updated = GETDATE()
      OUTPUT INSERTED.*
      WHERE Id = @id AND UserId = @userId
    `);

  return result.recordset[0];
};

export const deleteRopeItem = async (
  pool: sql.ConnectionPool,
  userId: number,
  ropeId: number
): Promise<void> => {
  await pool.request()
    .input('id', sql.Int, ropeId)
    .input('userId', sql.Int, userId)
    .query('DELETE FROM RopeItems WHERE Id = @id AND UserId = @userId');
};

export const getRopeServiceHistory = async (
  pool: sql.ConnectionPool,
  userId: number,
  ropeId: number
): Promise<ServiceHistoryData[]> => {
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('ropeId', sql.Int, ropeId)
    .query(`
      SELECT *
      FROM RopeServiceRecords
      WHERE RopeItemId = @ropeId AND UserId = @userId
      ORDER BY ServiceDate DESC, Id DESC
    `);

  return result.recordset;
};

export const addRopeServiceHistory = async (
  pool: sql.ConnectionPool,
  userId: number,
  ropeId: number,
  data: ServiceHistoryData
): Promise<void> => {
  await pool.request()
    .input('ropeId', sql.Int, ropeId)
    .input('userId', sql.Int, userId)
    .input('serviceType', sql.Int, data.serviceType)
    .input('serviceDate', sql.Date, toNullableDate(data.serviceDate))
    .input('notes', sql.NVarChar(500), toNullableString(data.notes))
    .query(`
      INSERT INTO RopeServiceRecords (
        RopeItemId,
        UserId,
        ServiceType,
        ServiceDate,
        Notes
      ) VALUES (
        @ropeId,
        @userId,
        @serviceType,
        @serviceDate,
        @notes
      )
    `);
};
