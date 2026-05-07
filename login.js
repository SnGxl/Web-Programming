
const SUPABASE_URL = 'https://cgiydhcrkwdjuoajefbj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nhFw6ucdW0t4_kEptMEkKg_QHONU-_E';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    if (!email || !password) {
        message.innerText = "الرجاء إدخال البريد وكلمة المرور";
        message.style.color = "orange";
        return;
    }

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        message.style.color = 'red';
        message.innerText = "خطأ: اسم المستخدم أو كلمة المرور غير صحيحة";
    } else {
        message.style.color = 'green';
        message.innerText = "تم تسجيل الدخول بنجاح! جاري التحويل...";
        
        setTimeout(() => {
            window.location.href = "mr.html"; 
        }, 1500);
    }
}
