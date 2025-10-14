import { format, parse, addMinutes } from 'date-fns';

export default async function reserveAppointmentHandler(req, res){
    //Get patient ID
    const patientId = req.user?.id;
    if (!patientId){
        return res.status(401).json({message: "Unauthorized access."})
    }
}