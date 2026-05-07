// إعدادات Supabase بالمفاتيح الجديدة
const SUPABASE_URL = 'https://cgiydhcrkwdjuoajefbj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nhFw6ucdW0t4_kEptMEkKg_QHONU-_E';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function handleSignup() {
    // جلب البيانات من الواجهة
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const fullName = document.getElementById('full_name').value;
    const message = document.getElementById('message');

    // 1. التحقق من تعبئة البيانات
    if (!fullName || !email || !password) {
        message.innerText = "الرجاء تعبئة كافة الحقول";
        message.style.color = "orange";
        return;
    }

    // 2. التحقق من الشروط
    if (!terms) {
        message.innerText = "يجب الموافقة على الشروط والأحكام";
        message.style.color = "orange";
        return;
    }

    // 3. التحقق من تطابق كلمة المرور
    if (password !== confirmPassword) {
        message.innerText = "كلمات المرور غير متطابقة";
        message.style.color = "red";
        return;
    }

    // 4. عملية التسجيل في Supabase
    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName
            }
        }
    });

    if (error) {
        message.innerText = "خطأ: " + error.message;
        message.style.color = "red";
    } else {
        message.innerText = "تم إنشاء الحساب! فضلاً تحقق من بريدك الإلكتروني";
        message.style.color = "green";
        // تنبيه ترحيبي
        alert("كفو يا " + fullName + "! تم التسجيل بنجاح، شيك على إيميلك الآن.");
    }
}
