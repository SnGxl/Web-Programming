const SUPABASE_URL = 'https://cgiydhcrkwdjuoajefbj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nhFw6ucdW0t4_kEptMEkKg_QHONU-_E';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);



async function login() {
    const userField = document.getElementById('username').value;
    const passField = document.getElementById('password').value;
    const message = document.getElementById('message');

    if (!userField || !passField) {
        message.innerText = "الرجاء إدخال اسم المستخدم وكلمة المرور";
        message.style.color = 'orange';
        return;
    }

    try {
        // استخدام نظام Supabase Auth الرسمي لتسجيل الدخول
        const { data, error } = await _supabase.auth.signInWithPassword({
            email: userField,
            password: passField,
        });

        if (error) {
            message.style.color = 'red';
            message.innerText = "خطأ: اسم المستخدم أو كلمة المرور غير صحيحة";
        } else {
            message.style.color = 'green';
            message.innerText = "تم تسجيل الدخول بنجاح! جاري التحويل...";
            
            setTimeout(() => {
                window.location.href = 'mr.html';
            }, 1500);
        }
    } catch (error) {
        message.innerText = "حدث خطأ في الاتصال بالسيرفر";
    }
}

async function signup() {
    const userField = document.getElementById('username').value;
    const passField = document.getElementById('password').value;
    const message = document.getElementById('message');

    if (!userField || !passField) {
        message.innerText = "الرجاء إدخال البريد الإلكتروني وكلمة المرور";
        message.style.color = 'orange';
        return;
    }

    try {
        // تنفيذ عملية التسجيل وإرسال الإيميل
        const { data, error } = await _supabase.auth.signUp({
            email: userField,
            password: passField,
        });

        if (error) {
            message.style.color = 'red';
            message.innerText = "خطأ: " + error.message;
        } else {
            message.style.color = 'green';
            message.innerText = "تم إرسال رابط التحقق! افحص بريدك الإلكتروني الآن.";
        }
    } catch (error) {
        message.innerText = "حدث خطأ في الاتصال";
    }
}
