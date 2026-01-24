const db = require('../config/db');

exports.createGroup = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) return res.status(400).json({ error: 'Group name is required' });

    try {
        // Start transaction
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const groupResult = await client.query(
                'INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING *',
                [name, userId]
            );
            const group = groupResult.rows[0];

            // Add creator as member
            await client.query(
                'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
                [group.id, userId]
            );

            await client.query('COMMIT');
            res.status(201).json(group);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create group' });
    }
};

exports.getMyGroups = async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await db.query(
            `SELECT g.*, COUNT(gm.user_id) as member_count 
       FROM groups g 
       JOIN group_members gm ON g.id = gm.group_id 
       WHERE g.id IN (SELECT group_id FROM group_members WHERE user_id = $1)
       GROUP BY g.id`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
};

exports.joinGroup = async (req, res) => {
    const groupId = req.params.id;
    const userId = req.user.userId;

    try {
        // Check if group exists
        const groupCheck = await db.query('SELECT * FROM groups WHERE id = $1', [groupId]);
        if (groupCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if already member
        const check = await db.query(
            'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Already a member' });
        }

        await db.query(
            'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
            [groupId, userId]
        );
        res.json({ message: 'Joined group successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to join group' });
    }
};

exports.getGroupMembers = async (req, res) => {
    const groupId = req.params.id;
    try {
        const result = await db.query(
            `SELECT u.id, u.name, u.phone, gm.joined_at 
       FROM users u 
       JOIN group_members gm ON u.id = gm.user_id 
       WHERE gm.group_id = $1`,
            [groupId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
};
