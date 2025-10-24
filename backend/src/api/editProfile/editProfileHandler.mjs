import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//GET method for user profile
export async function fetchUserProfile (req, res) {
    //Get user id from params
    const userId = req.params.userId;

    //Error handling
    if (!userId)
        return res.status(400).json({message: "User ID is required."});

    //Else, if userId is found
    const {data:userProfile, error} = await req.supabase
    .from("users")
    .select(`
        id,
        email,
        firstName,
        middleName,
        lastName,
        nameSuffix,
        contactNumber,
        role,
        profile_picture
    `)
    .eq("id", userId)
    .single();

    //Log retrieved information into console
    console.log("Retrieved information: ", userProfile);

    if (error || !userProfile )
        return res.status(400).json({message: "User not found."});

    return res.status(200).json(userProfile);
}

//PATCH method for user profile
export async function updateUserProfile(req, res){
    // --- Start of Debugging Logs ---
    console.log("--- INCOMING UPDATE REQUEST ---");
    console.log("Request Body (Text Fields):", req.body);
    console.log("Request Files (Images):", req.files);
    console.log("-------------------------------");
    // --- End of Debugging Logs ---

    const userId = req.params.userId;

    if(!userId)
        return res.status(400).json({message: "User not found."});

    const { 
        firstName,
        middleName,
        lastName,
        suffix,
        email,
        contactNumber,
        password,
        removeProfilePicture
    } = req.body;

    const updatePayload = {
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        nameSuffix: suffix,
        email: email,
        contactNumber: contactNumber,
    };

    // Find the uploaded file in the req.files array
    const uploadedFile = req.files && req.files.find(f => f.fieldname === 'profilePicture');

    // If a new file is uploaded, handle it
    if (uploadedFile) {
        const file = uploadedFile;
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await req.supabase.storage
            .from('profile-pictures')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return res.status(500).json({ message: "Failed to upload profile picture." });
        }

        const { data: urlData } = req.supabase.storage
            .from('profile-pictures')
            .getPublicUrl(fileName);

        updatePayload.profile_picture = urlData.publicUrl;
    } else if (removeProfilePicture === 'true') {
        updatePayload.profile_picture = null;
    }

    //If password is updated, hash it
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updatePayload.password_hash = hashedPassword;
    }
    
    //Remove any undefined properties to prevent overwriting existing data
    Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined || updatePayload[key] === null) {
            delete updatePayload[key];
        }
    });

    const { data: updatedUser, error } = await req.supabase
        .from("users")
        .update(updatePayload)
        .eq("id", userId)
        .select()
        .single();

    if (error) {
        console.error("Update error:", error);
        return res.status(500).json({ message: "Failed to update user profile.", error: error.message });
    }

    // 3. Create a new token with the updated information
    const newToken = jwt.sign(
        {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            role: updatedUser.role,
        },
        process.env.JWT_SECRET,
    );
    
    // 4. Send the new token back to the frontend
    return res.status(200).json({ 
        message: "User profile updated successfully.",
        token: newToken 
    });
}