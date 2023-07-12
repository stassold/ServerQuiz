import express, {Request, Response} from 'express';
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

        res.json({ access_token, refresh_token, aud, message: '' });
    } catch (err: any) {
        if (err.response && err.response.status === 400 && err.response.data.error === 'invalid_grant' && err.response.data.error_description === 'Invalid login credentials') {
            res.status(401).json({ access_token: '', refresh_token: '', aud: '', message: 'Invalid email or password' });
        } else {
            console.error(err);
            res.status(500).json({ access_token: '', refresh_token: '', aud: '', message: 'Internal server error' });
        }
    }
});

app.post('/signup', async (req: Request<{}, {}, LoginRequest>, res: Response<LoginResponse>) => {

    const requestBody = req.body;

    try {
        const { data } = await axios.post<SupabaseResponse>('https://mzyrvwlnsrixkgapzcgz.supabase.co/auth/v1/signup', requestBody, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Content-Type': 'application/json'
            }
        });

        const { access_token, refresh_token, user: { aud } } = data;

        res.json({ access_token, refresh_token, aud, message: '' });
    } catch (err: any) {
        if (err.response && err.response.status === 400 && err.response.data.msg === 'User already registered') {
            res.status(400).json({ access_token: '', refresh_token: '', aud: '', message: 'User already registered' });
        } else {
            res.status(500).json({ access_token: '', refresh_token: '', aud: '', message: 'Internal server error' });
        }
    }
});

app.get('/user', async (req: Request, res: Response) => {
    const userToken = req.headers.authorization?.replace('Bearer ', '');


    try {
        const { data } = await axios.get<SupabaseResponse>('https://mzyrvwlnsrixkgapzcgz.supabase.co/auth/v1/user', {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${userToken}`
            }
        });
        res.json(data);
    } catch (err: any) {
        if (err.response && err.response.status === 401) {
            res.status(401).json({ message: 'Invalid token' });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

app.listen(3010, () => {
    console.log('Server started on port 3010');
});