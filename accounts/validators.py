from .models import User

def validate_user_data(user_data):
    username = user_data.get("username")
    email = user_data.get("email")
    password = user_data.get("password")
    nickname = user_data.get("nickname")
    introduction = user_data.get("introduction")


    err_msg = []

    if len(nickname) < 2:
        err_msg.append("닉네임이 너무 짧습니다.")

    if len(password) < 8:
        err_msg.append("비밀번호가 너무 짧습니다")

    if User.objects.filter(username=username).exists():
        err_msg.append("이미 존재하는 username 입니다")

    if User.objects.filter(email=email).exists():
        err_msg.append("이미 존재하는 email입니다")

    return err_msg