//POST method for services
export async function createServiceHandler(req, res){
    console.log("Incoming service payload:", req.body);
    
    const{
        name,
        description,
        price,
        unit,
        duration,
        type,
        status
    } = req.body;

    //Basic validation
    if (!name || !price || !type || !duration) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    //Insert into services table
    const { data, error } = await req.supabase
        .from('services')
        .insert([{
            description: description,
            price: price,
            unit: unit,
            service_name: name,
            estimated_duration: duration, // Store the integer directly
            service_type: type,
            status: status
        }])
        .select()
        .single();

    if (error) {
        console.error("Error inserting service:", error);
        return res.status(500).json({ message: "Error inserting service.", error });
    }  

    // Map DB columns to frontend keys
    const mappedService = {
        id: data.id,
        name: data.service_name,
        description: data.description,
        price: data.price,
        unit: data.unit,
        duration: data.estimated_duration,
        type: data.service_type,
        status: data.status
    };

    return res.status(201).json({ message: "Service created successfully.", service: mappedService });
}

//GET method for services
export async function getServicesHandler(req, res) {
    
    //Add filtering based on status query parameter ---
    const { status } = req.query;
    let query = req.supabase.from('services').select('*');

    if (status === 'archived') {
        // If the request asks for archived services, fetch only those.
        query = query.eq('status', 'Archived');
    } else {
        // By default, fetch all services that are NOT archived.
        query = query.not('status', 'eq', 'Archived');
    }

    const { data, error } = await query;

    if (error) {
        return res.status(500).json({ message: "Failed to fetch services.", error });
    }
    // Map DB columns to frontend keys
    const services = data.map(s => ({
        id: s.id,
        name: s.service_name,
        description: s.description,
        price: s.price,
        unit: s.unit,
        duration: s.estimated_duration, 
        type: s.service_type,
        status: s.status
    }));
    return res.status(200).json({ services });
}

//Get services to populate billing fields
export async function getBillingServicesHandler(req, res) {
    // This handler fetches only active services and returns a simplified array 
    // with only the fields needed for the billing combobox.
    const { data, error } = await req.supabase
        .from('services')
        .select('id, service_name, price') // Select only the necessary columns
        .not('status', 'in', '("Archived","Unavailable")');

    if (error) {
         console.error("Backend Error: Failed to fetch billing services.", error); // --- DEBUG LOG ---
        return res.status(500).json({ message: "Failed to fetch billing services.", error });
    }

    // Return the data as a direct array, which is what the combobox expects.
    return res.status(200).json(data);
}


//PATCH method for services
export async function updateServiceHandler(req, res) {

    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Service ID is required." });
    }

    // Only update fields that are present in the request body
    const {
        name,
        description,
        price,
        unit,
        duration,
        type,
        status
    } = req.body;

    // Build update object using DB column names
    const updateObj = {};
    if (name !== undefined) updateObj.service_name = name;
    if (description !== undefined) updateObj.description = description;
    if (price !== undefined) updateObj.price = price;
    if (unit !== undefined) updateObj.unit = unit;
    if (duration !== undefined) updateObj.estimated_duration = duration; // Store the integer
    if (type !== undefined) updateObj.service_type = type;
    if (status !== undefined) updateObj.status = status;

    if (Object.keys(updateObj).length === 0) {
        return res.status(400).json({ message: "No fields to update." });
    }

    const { data, error } = await req.supabase
        .from('services')
        .update(updateObj)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error updating service:", error);
        return res.status(500).json({ message: "Error updating service.", error });
    }

    // Map DB columns to frontend keys
    const mappedService = {
        id: data.id,
        name: data.service_name,
        description: data.description,
        price: data.price,
        unit: data.unit,
        duration: data.estimated_duration,
        type: data.service_type,
        status: data.status
    };

    return res.status(200).json({ message: "Service updated successfully.", service: mappedService });
}