import { Router, Response, Request } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest } from './helpers/user.helper';
import { getRecordsByGearId } from './helpers/records.data';
import { toNullableDate, toNullableNumber, toNullableString, toBit } from './helpers/sql.helper';
import { GearServiceStatus } from '../src/types/GearStatusType';

const router = Router();

// Add gear
router.post('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
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
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const id = Number(req.params.id);
    await pool.request().input('id', sql.Int, id).input('userId', sql.Int, userId).query('DELETE FROM GearItems WHERE Id=@id AND UserId=@userId');
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gear' });
  }
});

/// =========================================================================
/// Trip history endpoints
/// =========================================================================

// GET /api/equipment/gear/:gearId/descents - get all canyon records using this gear
router.get('/:gearId/descents', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const gearId = Number(req.params.gearId);
    const records = await getRecordsByGearId(pool, userId, gearId);
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch descents' });
  }
});

/// =========================================================================
/// Service history endpoints
/// =========================================================================

router.get('/widget', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const historyRes = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`WITH GearItemsToService AS (
            SELECT 
                gi.*,
                gsr.StatusCode AS LatestStatusCode,
                gsr.ServiceDate AS LastServiceDate
            FROM GearItems gi
            OUTER APPLY (
                SELECT TOP (1) 
                    gsr_sub.StatusCode, 
                    gsr_sub.ServiceDate
                FROM GearServiceRecords gsr_sub
                WHERE gsr_sub.GearItemId = gi.Id 
                  AND gsr_sub.UserId = gi.UserId  
                  AND gsr_sub.StatusCode != ${GearServiceStatus.None}
                ORDER BY gsr_sub.ServiceDate DESC, gsr_sub.Id DESC
            ) gsr
            WHERE gi.UserId = @UserId 
              AND gi.IsRetired = 0
        )
        SELECT TOP 5 * 
        FROM GearItemsToService 
        WHERE 
    -- Items with service history within 6 months
    COALESCE(LastServiceDate, InServiceDate, Created) < DATEADD(month, -6, GETDATE())
    OR RetirementDate <= GETDATE()
ORDER BY 
    CASE WHEN RetirementDate IS NOT NULL AND RetirementDate <= GETDATE() THEN 0 ELSE 1 END ASC,
    RetirementDate ASC,
    CASE WHEN LastServiceDate IS NULL THEN 1 ELSE 0 END ASC,
    LastServiceDate DESC,
    CASE WHEN InServiceDate IS NULL THEN 1 ELSE 0 END ASC,
    InServiceDate DESC,
    CASE WHEN Created IS NULL THEN 1 ELSE 0 END ASC,
    Created DESC`)
    res.json(historyRes.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gear service history' });
  }
});

router.get('/:id/service', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const gearId = Number(req.params.id);

    const historyRes = await pool.request()
      .input('userId', sql.Int, userId)
      .input('gearId', sql.Int, gearId)
      .query('SELECT * FROM GearServiceRecords WHERE GearItemId = @gearId AND UserId = @userId ORDER BY ServiceDate DESC, DateCreated DESC');
    res.json(historyRes.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gear service history' });
  }
});

router.post('/:id/service', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const gearId = Number(req.params.id);
    const { serviceType, statusCode, serviceDate, notes } = req.body;
    const normalizedStatusCode = Number.isFinite(Number(statusCode)) ? Number(statusCode) : 1;

    await pool.request()
      .input('gearId', sql.Int, gearId)
      .input('userId', sql.Int, userId)
      .input('serviceType', sql.Int, serviceType)
      .input('statusCode', sql.SmallInt, normalizedStatusCode)
      .input('serviceDate', sql.Date, toNullableDate(serviceDate))
      .input('notes', sql.NVarChar(500), toNullableString(notes))
      .query(`INSERT INTO GearServiceRecords (
                GearItemId,
                UserId,
                ServiceType,
                StatusCode,
                ServiceDate,
                Notes,
                DateCreated
              ) VALUES (
                @gearId,
                @userId,
                @serviceType,
                @statusCode,
                @serviceDate,
                @notes,
                GETUTCDATE()
              );

              IF @statusCode = ${GearServiceStatus.Retired}
              BEGIN
                UPDATE GearItems
                SET IsRetired = 1,
                    Updated = GETDATE()
                WHERE Id = @gearId AND UserId = @userId;
              END`);
    res.status(201).json({ message: 'Service record added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add service record' });
  }
});

export default router;
