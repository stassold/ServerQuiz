import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';


const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16eXJ2d2xuc3JpeGtnYXB6Y2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzQzNTgyNjEsImV4cCI6MTk4OTkzNDI2MX0.fkz_ibb3fLeHHRDwi5_MfwzXGbL40mQKvuT6eu7c_Q8'

const app = express();

app.use(cors());
app.use(express.json());

interface LoginRequest {
    email: string;
    password: string;
}

interface SupabaseResponse {
    access_token: string;
    refresh_token: string;
    user: {
        aud: string;
    };
}

interface LoginResponse {
    access_token: string;
    refresh_token: string;
    aud: string;
    message?: string;
}

app.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>) => {

    const requestBody = req.body;

    try {
        const { data } = await axios.post<SupabaseResponse>('https://mzyrvwlnsrixkgapzcgz.supabase.co/auth/v1/token?grant_type=password', requestBody, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
            }
        });

        const { access_token, refresh_token, user: { aud } } = data;

        res.json({ access_token, refresh_token, aud });
    } catch (err) {
        //console.error(err);
        res.status(500).json({ access_token: '', refresh_token: '', aud: '', message: 'Internal server error' });
    }
});

app.listen(3010, () => {
    console.log('Server started on port 3010');
});