const SUPABASE_URL = 'https://cgiydhcrkwdjuoajefbj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nhFw6ucdW0t4_kEptMEkKg_QHONU-_E';

async function login() {
    const userField = document.getElementById('username').value;
    const passField = document.getElementById('password').value;
    const message = document.getElementById('message');

    if (!userField || !passField) {
        message.innerText = 'الرجاء إدخال اسم المستخدم وكلمة المرور';
        message.style.color = 'orange';
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${userField}&password=eq.${passField}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        const data = await response.json();

        if (data.length > 0) {
            message.style.color = 'green';
            message.innerText = 'تم تسجيل الدخول بنجاح! جاري التحويل...';
            
            setTimeout(() => {
                window.location.href = 'planner.html';
            }, 1500);
        } else {
            message.style.color = 'red';
            message.innerText = 'خطأ: اسم المستخدم أو كلمة المرور غير صحيحة.';
        }
    } catch (error) {
        message.innerText = 'حدث خطأ في الاتصال بالسيرفر.';
    }
}
