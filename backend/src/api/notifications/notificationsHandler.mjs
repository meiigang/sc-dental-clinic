/**
 * Creates a notification for a user.
 * @param {any} supabase
 * @param {string} userId - The ID of the user to notify.
 * @param {string} type - The type of notification (e.g., 'APPOINTMENT_CONFIRMED').
 * @param {object} data - A JSON object with notification details.
 */

export async function createNotification(supabase, userId, type, data){
    //Insert record into notifications table
    const { error } = await supabase
    .from('notifications')
    .insert([{ user_id: userId, type, data}])

    if (error) {
        console.error('Error creating notification:', error);
    }
}

//FETCH notification for a user
export async function getNotification(req, res) {
    //Get user ID
    const userId = req.user.id;

    const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: false});

    if(error) return res.status(500).json({error: error.message});

    return res.status(200).json(data);
}

//MARK notification as read
export async function markAsRead(req, res){
    const {id} = req.params;
    const userId = req.user.id;
    
    const { error } = await supabase
    .from('notifications')
    .update({is_read: true})
    .match({id: id, user_id: userId});

    if(error) return res.status(500).json({error: error.message});

    return res.status(200).json({message: 'Notification marked as read.'})
}