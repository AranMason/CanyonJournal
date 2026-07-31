import { Router, Response, Request } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest } from './helpers/user.helper';

// TODO:
// - DELETE
// - UPDATE
// - Gear UI to create a set
// This will involve a pop-up, that will select one or more items to be in the set using checkboxes. And a text field for the name.
// - Record UI to select a set.
// This will involve an additional dropdown selector, where you can select an item set. When selecting an option, all items in the set will automatically populate the gear field.

const router = Router();

// get all sets

type GearSets = {
  Id: number,
  Name: string,
  Items: number[]
};

function getSetFromDb(record: any): GearSets[] {
  return record.map((element: any): GearSets => {
    const members = (element.Members ? JSON.parse(element.Members) : []) as { GearId: number }[];
    return {
      Id: element.Id as number,
      Name: element.Name,
      Items: members.map(s => s.GearId)
    }
  });
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.BigInt(), userId)
      .query(`SELECT
                  sit.Id,
                  sit.Name,
                  (
                      SELECT mem.GearId
                      FROM GearItemSetMember mem
                      WHERE mem.SetId = sit.Id
                      FOR JSON PATH
                  ) AS Members
              FROM GearItemSet sit
              WHERE sit.UserId = @UserId;
              `);
    res.status(201).json(getSetFromDb(result.recordset));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve gear sets' });
  }
})

// get a set
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    var paramId = parseInt(req.params.id);

    if (!paramId || paramId <= 0) {
      return res.status(400).json({ error: 'Invalid Set Requested' })
    }

    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.BigInt(), userId)
      .input('setId', sql.BigInt(), paramId)
      .query(`SELECT
                  sit.Id,
                  sit.Name,
                  (
                      SELECT mem.GearId
                      FROM GearItemSetMember mem
                      WHERE mem.SetId = sit.Id
                      FOR JSON PATH
                  ) AS Members
              FROM GearItemSet sit
              WHERE sit.UserId = @UserId AND sit.Id = @setId`);

    return getSetFromDb(result.recordset[0])
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve gear set' });
  }
})

// Create gear set
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pool = await getPool();


    const {
      Name: name,
      GearIds: gearIds
    }: {
      Name: string,
      GearIds: number[]
    } = req.body;

    const result = await pool.request()
      .input('name', sql.NVarChar(200), name)
      .input('userId', sql.BigInt(), userId)
      .query(`INSERT INTO GearItemSet (     
                UserId,
                Name
              )
              OUTPUT INSERTED.*
              VALUES (
                @userId,
                @name
              )`);

    const setId = result.recordset[0].Id;

    // Bulk insert gearIds into GearItemSetMember
    if (gearIds && gearIds.length > 0) {
      const valuesClauses = gearIds.map((_, idx) => `(@setId, @gearId${idx})`).join(', ');
      const insertQuery = `INSERT INTO GearItemSetMember (SetId, GearId) VALUES ${valuesClauses}`;

      const insertRequest = pool.request().input('setId', sql.BigInt(), setId);
      gearIds.forEach((gearId, idx) => {
        insertRequest.input(`gearId${idx}`, sql.BigInt(), gearId);
      });

      await insertRequest.query(insertQuery);
    }

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create gear set' });
  }
});


// Delete gear set
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pool = await getPool();
    await pool.request()
      .input('userId', sql.BigInt(), userId)
      .input('setId', sql.BigInt(), req.params.id)
      // TODO: Does this cascade into GearItemSetMember?
      .query(`DELETE FROM GearItemSet WHERE Id = @setId and UserId = @userId`);

    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Failed to delete gear set' });
  }
})

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pool = await getPool();

    const {
      Name,
      Items
    }: GearSets = req.body;

    var setId = parseInt(req.params.id);

    await pool.request()
      .input('setId', sql.BigInt(), setId)
      .input('userId', sql.BigInt(), userId)
      .input('name', sql.NVarChar(200), Name)
      .query(`UPDATE GearItemSet SET Name = @name WHERE Id = @setId AND UserId = @userId`);

    // Delete existing members
    await pool.request()
      .input('setId', sql.BigInt(), req.params.id)
      .input('userId', sql.BigInt(), userId)
      .query(`DELETE FROM GearItemSetMember WHERE SetId = @setId AND SetId IN (SELECT Id FROM GearItemSet WHERE UserId = @userId)`);
    // Insert new members
    if (Items && Items.length > 0) {
      const valuesClauses = Items.map((_, idx) => `(@setId, @gearId${idx})`).join(', ');
      const insertQuery = `INSERT INTO GearItemSetMember (SetId, GearId) VALUES ${valuesClauses}`;

      const insertRequest = pool.request().input('setId', sql.BigInt(), req.params.id);
      Items.forEach((gearId, idx) => {
        insertRequest.input(`gearId${idx}`, sql.BigInt(), gearId);
      });

      await insertRequest.query(insertQuery);
    }

    res.status(200).json({ message: 'Gear set updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update gear set' });
  }
});

export default router;