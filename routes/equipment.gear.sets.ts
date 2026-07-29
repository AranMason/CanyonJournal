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

// Add gear set
router.post('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);

    if(!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }


    const {
      name,
      gearIds
    }: {
        name: string,
        gearIds: number[]
    } = req.body;



    const result = await pool.request()
      .input('name', sql.NVarChar(200), name)
      .input('userId', sql.BigInt(), userId)
      .query(`INSERT INTO GearItemSets (     
                UserId,
                Name,
                Created,
                Updated
              )
              OUTPUT INSERTED.*
              VALUES (
                @userId,
                @name,
                GETDATE(),
                GETDATE()
              )`);

    const setId = result.recordset[0].Id;

    // Bulk insert gearIds into GearItemSetMembers
    if (gearIds && gearIds.length > 0) {
      const valuesClauses = gearIds.map((_, idx) => `(@setId, @gearId${idx})`).join(', ');
      const insertQuery = `INSERT INTO GearItemSetMembers (SetId, GearId) VALUES ${valuesClauses}`;
      
      const insertRequest = pool.request().input('setId', sql.BigInt(), setId);
      gearIds.forEach((gearId, idx) => {
        insertRequest.input(`gearId${idx}`, sql.BigInt(), gearId);
      });
      
      await insertRequest.query(insertQuery);
    }

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create gear set' });
  }
});

// get all sets

type GearSets = {
    Name: string,
    Items: number[]
};
// get a set
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);

    if(!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.request()
      .input('name', sql.NVarChar(200), name)
      .input('userId', sql.BigInt(), userId)
      .query(`SELECT sit.Id, sit.Name, mem.GearId FROM GearItemSets sit
                INNER JOIN GearItemSetMembers mem ON sit.Id = mem.SetId 
                WHERE UserId = @UserId`);

    

    return result.recordset[0].reduce((cum: { [x in number]: {}}, item: { Id: number, Name: string, GearId: number}) {

        var entry = cum[item.Id] as GearSets
        if(!entry) {
            entry = {
                Name: item.Name,
                Items: []
            }
            cum[item.Id] = entry
        }

        entry.Items.push(item.GearId);

        return cum;
    }, {})


  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve gear set' });
  }
})

export default router;