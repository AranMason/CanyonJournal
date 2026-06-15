import { Router, Response, Request } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest } from './helpers/user.helper';

const router = Router();

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toNullableDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === '') return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const toBit = (value: unknown): boolean => {
  return value === true || value === 1 || value === '1' || value === 'true';
};

// Get all gear and ropes for the user
router.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    console.log("userId in /api/equipment:", userId);
    const gearRes = await pool.request().input('userId', sql.Int, userId).query('SELECT *, (SELECT MAX(ServiceDate) FROM GearServiceRecords gsr WHERE gsr.GearItemId = GearItems.Id AND gsr.ServiceType = 1) AS LastServicedDate, (SELECT MAX(ServiceDate) FROM GearServiceRecords gsr WHERE gsr.GearItemId = GearItems.Id AND gsr.ServiceType = 2) AS LastInspectionDate FROM GearItems WHERE GearItems.UserId = @userId');
    const ropeRes = await pool.request().input('userId', sql.Int, userId).query('SELECT * FROM RopeItems WHERE UserId = @userId');
    res.json({ gear: gearRes.recordset, ropes: ropeRes.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gear/ropes' });
  }
});

// Add gear
router.post('/gear', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const {
      name,
      category,
      notes,
      isRetired,
      manufacturer,
      manufactureDate,
      inServiceDate,
      retirementDate,
      serialNumber,
      model,
      weightGrams
    } = req.body;

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(200), name)
      .input('category', sql.NVarChar(100), category)
      .input('notes', sql.NVarChar(500), toNullableString(notes))
      .input('isRetired', sql.Bit, toBit(isRetired))
      .input('manufacturer', sql.NVarChar(255), toNullableString(manufacturer))
      .input('manufactureDate', sql.Date, toNullableDate(manufactureDate))
      .input('inServiceDate', sql.Date, toNullableDate(inServiceDate))
      .input('retirementDate', sql.Date, toNullableDate(retirementDate))
      .input('serialNumber', sql.NVarChar(255), toNullableString(serialNumber))
      .input('model', sql.NVarChar(255), toNullableString(model))
      .input('weightGrams', sql.Float, toNullableNumber(weightGrams))
      .query(`INSERT INTO GearItems (
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
                model,
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
              )`);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add gear' });
  }
});

// Edit gear
router.put('/gear/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const id = Number(req.params.id);
    const {
      name,
      category,
      notes,
      isRetired,
      manufacturer,
      manufactureDate,
      inServiceDate,
      retirementDate,
      serialNumber,
      model,
      weightGrams
    } = req.body;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(200), name)
      .input('category', sql.NVarChar(100), category)
      .input('notes', sql.NVarChar(500), toNullableString(notes))
      .input('isRetired', sql.Bit, toBit(isRetired))
      .input('manufacturer', sql.NVarChar(255), toNullableString(manufacturer))
      .input('manufactureDate', sql.Date, toNullableDate(manufactureDate))
      .input('inServiceDate', sql.Date, toNullableDate(inServiceDate))
      .input('retirementDate', sql.Date, toNullableDate(retirementDate))
      .input('serialNumber', sql.NVarChar(255), toNullableString(serialNumber))
      .input('model', sql.NVarChar(255), toNullableString(model))
      .input('weightGrams', sql.Float, toNullableNumber(weightGrams))
      .query(`UPDATE GearItems SET
                Name=@name,
                Category=@category,
                Notes=@notes,
                IsRetired=@isRetired,
                Manufacturer=@manufacturer,
                ManufactureDate=@manufactureDate,
                InServiceDate=@inServiceDate,
                RetirementDate=@retirementDate,
                SerialNumber=@serialNumber,
                model=@model,
                WeightGrams=@weightGrams,
                Updated=GETDATE()
              OUTPUT INSERTED.*
              WHERE Id=@id AND UserId=@userId`);
    if (!result.recordset[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update gear' });
  }
});

// Delete gear
router.delete('/gear/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const id = Number(req.params.id);
    await pool.request().input('id', sql.Int, id).input('userId', sql.Int, userId).query('DELETE FROM GearItems WHERE Id=@id AND UserId=@userId');
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gear' });
  }
});

// Add rope
router.post('/rope', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const {
      name,
      diameter,
      length,
      unit,
      notes,
      isRetired,
      manufacturer,
      manufactureDate,
      inServiceDate,
      retirementDate,
      serialNumber,
      model,
      weightGrams,
      parentRopeItemsId
    } = req.body;

    const parsedParentRopeId = toNullableNumber(parentRopeItemsId);
    if (parsedParentRopeId !== null) {
      const parentResult = await pool.request()
        .input('userId', sql.Int, userId)
        .input('parentRopeItemsId', sql.Int, parsedParentRopeId)
        .query('SELECT Id FROM RopeItems WHERE Id = @parentRopeItemsId AND UserId = @userId');

      if (parentResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Invalid parent rope selected' });
      }
    }

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(200), name)
      .input('diameter', sql.Float, toNullableNumber(diameter))
      .input('length', sql.Float, toNullableNumber(length))
      .input('unit', sql.NVarChar(20), unit)
      .input('notes', sql.NVarChar(500), toNullableString(notes))
      .input('isRetired', sql.Bit, toBit(isRetired))
      .input('manufacturer', sql.NVarChar(255), toNullableString(manufacturer))
      .input('manufactureDate', sql.Date, toNullableDate(manufactureDate))
      .input('inServiceDate', sql.Date, toNullableDate(inServiceDate))
      .input('retirementDate', sql.Date, toNullableDate(retirementDate))
      .input('serialNumber', sql.NVarChar(255), toNullableString(serialNumber))
      .input('model', sql.NVarChar(255), toNullableString(model))
      .input('weightGrams', sql.Float, toNullableNumber(weightGrams))
      .input('parentRopeItemsId', sql.Int, parsedParentRopeId)
      .query(`INSERT INTO RopeItems (
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
                model,
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
              )`);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add rope' });
  }
});

// Edit rope
router.put('/rope/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const id = Number(req.params.id);
    const {
      name,
      diameter,
      length,
      unit,
      notes,
      isRetired,
      manufacturer,
      manufactureDate,
      inServiceDate,
      retirementDate,
      serialNumber,
      model,
      weightGrams,
      parentRopeItemsId
    } = req.body;

    const parsedParentRopeId = toNullableNumber(parentRopeItemsId);
    if (parsedParentRopeId !== null) {
      if (parsedParentRopeId === id) {
        return res.status(400).json({ error: 'A rope cannot reference itself as parent' });
      }

      const parentResult = await pool.request()
        .input('userId', sql.Int, userId)
        .input('parentRopeItemsId', sql.Int, parsedParentRopeId)
        .query('SELECT Id FROM RopeItems WHERE Id = @parentRopeItemsId AND UserId = @userId');

      if (parentResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Invalid parent rope selected' });
      }
    }

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(200), name)
      .input('diameter', sql.Float, toNullableNumber(diameter))
      .input('length', sql.Float, toNullableNumber(length))
      .input('unit', sql.NVarChar(20), unit)
      .input('notes', sql.NVarChar(500), toNullableString(notes))
      .input('isRetired', sql.Bit, toBit(isRetired))
      .input('manufacturer', sql.NVarChar(255), toNullableString(manufacturer))
      .input('manufactureDate', sql.Date, toNullableDate(manufactureDate))
      .input('inServiceDate', sql.Date, toNullableDate(inServiceDate))
      .input('retirementDate', sql.Date, toNullableDate(retirementDate))
      .input('serialNumber', sql.NVarChar(255), toNullableString(serialNumber))
      .input('model', sql.NVarChar(255), toNullableString(model))
      .input('weightGrams', sql.Float, toNullableNumber(weightGrams))
      .input('parentRopeItemsId', sql.Int, parsedParentRopeId)
      .query(`UPDATE RopeItems SET
                Name=@name,
                Diameter=@diameter,
                Length=@length,
                Unit=@unit,
                Notes=@notes,
                IsRetired=@isRetired,
                Manufacturer=@manufacturer,
                ManufactureDate=@manufactureDate,
                InServiceDate=@inServiceDate,
                RetirementDate=@retirementDate,
                SerialNumber=@serialNumber,
                Model=@model,
                WeightGrams=@weightGrams,
                ParentRopeItemsId=@parentRopeItemsId,
                Updated=GETDATE()
              OUTPUT INSERTED.*
              WHERE Id=@id AND UserId=@userId`);
    if (!result.recordset[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update rope' });
  }
});

// Delete rope
router.delete('/rope/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const id = Number(req.params.id);
    await pool.request().input('id', sql.Int, id).input('userId', sql.Int, userId).query('DELETE FROM RopeItems WHERE Id=@id AND UserId=@userId');
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rope' });
  }
});

router.post('/gear/:id/service', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const gearId = Number(req.params.id);
    const { serviceType, serviceDate, notes } = req.body;

    await pool.request()
      .input('gearId', sql.Int, gearId)
      .input('userId', sql.Int, userId)
      .input('serviceType', sql.Int, serviceType)
      .input('serviceDate', sql.Date, toNullableDate(serviceDate))
      .input('notes', sql.NVarChar(500), toNullableString(notes))
      .query(`INSERT INTO GearServiceRecords (
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
              )`);
    res.status(201).json({ message: 'Service record added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add service record' });
  }
});

export default router;
