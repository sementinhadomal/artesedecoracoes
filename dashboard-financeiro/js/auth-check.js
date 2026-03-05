// Auth Check para Dashboard
(function () {
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    const token = getCookie('auth_token');

    // Se não houver token e não estivermos na página de login, redireciona
    if (!token && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
})();
