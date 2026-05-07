const SUPABASE_URL = 'https://cgiydhcrkwdjuoajefbj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nhFw6ucdwDt4_kEptMEkKg_QHONU-_E';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function handleSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const fullName = document.getElementById('full_name').value;
    const message = document.getElementById('message');

    if (!fullName || !email || !password) {
        message.innerText = "الرجاء تعبئة كافة البيانات";
        message.style.color = "orange";
        return;
    }

    if (!terms) {
        message.innerText = "يجب الموافقة على الشروط";
        message.style.color = "orange";
        return;
    }

    if (password !== confirmPassword) {
        message.innerText = "كلمات المرور غير متطابقة";
        message.style.color = "red";
        return;
    }

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
        message.innerText = "تم إنشاء الحساب! تحقق من بريدك الإلكتروني";
        message.style.color = "green";
        alert("أهلاً بك يا " + fullName + "، تم التسجيل بنجاح!");
    }
}
