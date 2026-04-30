// إعدادات Supabase (ضع بياناتك هنا)
const SUPABASE_URL = 'https://cgiydhcrkwdjuoajefbj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nhFw6ucdW0t4_kEptMEkKg_QHONU-_E';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function handleSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const message = document.getElementById('message');

    // 1. التحقق من الشروط
    if (!terms) {
        message.innerText = "يجب الموافقة على الشروط";
        message.style.color = "orange";
        return;
    }

    // 2. التحقق من تطابق كلمات المرور
    if (password !== confirmPassword) {
        message.innerText = "كلمات المرور غير متطابقة";
        message.style.color = "red";
        return;
    }

    // 3. إرسال الطلب لـ Supabase
    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        message.innerText = "خطأ: " + error.message;
        message.style.color = "red";
    } else {
        message.innerText = "تم إنشاء الحساب! تحقق من بريدك الإلكتروني";
        message.style.color = "green";
    }
}
