import { sql } from '../middleware/sqlserver';

export interface GearItemData {
  name: string;
  category: string;
  notes: string | null;
  isRetired: boolean;
  manufacturer: string | null;
  manufactureDate: Date | null;
  inServiceDate: Date | null;
  retirementDate: Date | null;
  serialNumber: string | null;
  model: string | null;
  weightGrams: number | null;
}

export interface ServiceHistoryData {
  serviceType: number;
  serviceDate: Date | null;
  notes: string | null;
}

export const getEquipmentForUser = async (
  pool: sql.ConnectionPool,
  userId: number
): Promise<{ gear: any[]; ropes: any[] }> => {
  const [gearRes, ropeRes] = await Promise.all([
    pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT *,
               (SELECT MAX(ServiceDate) FROM GearServiceRecords gsr WHERE gsr.GearItemId = GearItems.Id AND gsr.ServiceType = 1) AS LastServicedDate,
               (SELECT MAX(ServiceDate) FROM GearServiceRecords gsr WHERE gsr.GearItemId = GearItems.Id AND gsr.ServiceType = 2) AS LastInspectionDate
        FROM GearItems
        WHERE GearItems.UserId = @userId
      `),
    pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT *,
               (SELECT MAX(ServiceDate) FROM RopeServiceRecords rsr WHERE rsr.RopeItemId = RopeItems.Id AND rsr.ServiceType = 1) AS LastServicedDate,
               (SELECT MAX(ServiceDate) FROM RopeServiceRecords rsr WHERE rsr.RopeItemId = RopeItems.Id AND rsr.ServiceType = 2) AS LastInspectionDate
        FROM RopeItems
        WHERE RopeItems.UserId = @userId
      `)
  ]);

  return {
    gear: gearRes.recordset,
    ropes: ropeRes.recordset,
  };
};

export const createGearItem = async (
  pool: sql.ConnectionPool,
  userId: number,
  data: GearItemData
): Promise<any> => {
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('name', sql.NVarChar(200), data.name)
    .input('category', sql.NVarChar(100), data.category)
    .input('notes', sql.NVarChar(500), data.notes)
    .input('isRetired', sql.Bit, data.isRetired)
    .input('manufacturer', sql.NVarChar(255), data.manufacturer)
    .input('manufactureDate', sql.Date, data.manufactureDate)
    .input('inServiceDate', sql.Date, data.inServiceDate)
    .input('retirementDate', sql.Date, data.retirementDate)
    .input('serialNumber', sql.NVarChar(255), data.serialNumber)
    .input('model', sql.NVarChar(255), data.model)
    .input('weightGrams', sql.Float, data.weightGrams)
    .query(`
      INSERT INTO GearItems (
        UserId,
        Name,
        Category,
        Notes,
        IsRetired,
        Manufacturer,
        ManufactureDate,
        InServiceDate,
        RetirementDate,
        SerialNumber,
        Model,
        WeightGrams,
        Created,
        Updated
      )
      OUTPUT INSERTED.*
      VALUES (
        @userId,
        @name,
        @category,
        @notes,
        @isRetired,
        @manufacturer,
        @manufactureDate,
        @inServiceDate,
        @retirementDate,
        @serialNumber,
        @model,
        @weightGrams,
        GETDATE(),
        GETDATE()
      )
    `);

  return result.recordset[0];
};

export const updateGearItem = async (
  pool: sql.ConnectionPool,
  userId: number,
  gearId: number,
  data: GearItemData
): Promise<any | undefined> => {
  const result = await pool.request()
    .input('id', sql.Int, gearId)
    .input('userId', sql.Int, userId)
    .input('name', sql.NVarChar(200), data.name)
    .input('category', sql.NVarChar(100), data.category)
    .input('notes', sql.NVarChar(500), data.notes)
    .input('isRetired', sql.Bit, data.isRetired)
    .input('manufacturer', sql.NVarChar(255), data.manufacturer)
    .input('manufactureDate', sql.Date, data.manufactureDate)
    .input('inServiceDate', sql.Date, data.inServiceDate)
    .input('retirementDate', sql.Date, data.retirementDate)
    .input('serialNumber', sql.NVarChar(255), data.serialNumber)
    .input('model', sql.NVarChar(255), data.model)
    .input('weightGrams', sql.Float, data.weightGrams)
    .query(`
      UPDATE GearItems SET
        Name = @name,
        Category = @category,
        Notes = @notes,
        IsRetired = @isRetired,
        Manufacturer = @manufacturer,
        ManufactureDate = @manufactureDate,
        InServiceDate = @inServiceDate,
        RetirementDate = @retirementDate,
        SerialNumber = @serialNumber,
        Model = @model,
        WeightGrams = @weightGrams,
        Updated = GETDATE()
      OUTPUT INSERTED.*
      WHERE Id = @id AND UserId = @userId
    `);

  return result.recordset[0];
};

export const deleteGearItem = async (
  pool: sql.ConnectionPool,
  userId: number,
  gearId: number
): Promise<void> => {
  await pool.request()
    .input('id', sql.Int, gearId)
    .input('userId', sql.Int, userId)
    .query('DELETE FROM GearItems WHERE Id = @id AND UserId = @userId');
};

export const getGearServiceHistory = async (
  pool: sql.ConnectionPool,
  userId: number,
  gearId: number
): Promise<any[]> => {
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('gearId', sql.Int, gearId)
    .query(`
      SELECT *
      FROM GearServiceRecords
      WHERE GearItemId = @gearId AND UserId = @userId
      ORDER BY ServiceDate DESC, Id DESC
    `);

  return result.recordset;
};

export const addGearServiceHistory = async (
  pool: sql.ConnectionPool,
  userId: number,
  gearId: number,
  data: ServiceHistoryData
): Promise<void> => {
  await pool.request()
    .input('gearId', sql.Int, gearId)
    .input('userId', sql.Int, userId)
    .input('serviceType', sql.Int, data.serviceType)
    .input('serviceDate', sql.Date, data.serviceDate)
    .input('notes', sql.NVarChar(500), data.notes)
    .query(`
      INSERT INTO GearServiceRecords (
        GearItemId,
        UserId,
        ServiceType,
        ServiceDate,
        Notes
      ) VALUES (
        @gearId,
        @userId,
        @serviceType,
        @serviceDate,
        @notes
      )
    `);
};

