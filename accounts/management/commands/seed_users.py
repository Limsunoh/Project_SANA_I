# 한국어로 유저 데이터를 시딩하기 위한 명령어
# 터미널에 python manage.py seed_users 를 입력해 num_users 만큼의 유저 데이터 생성

from django.core.management.base import BaseCommand
from accounts.models import User
import random
from faker import Faker
from django.utils import timezone

class Command(BaseCommand):
    help = 'Seed the database with realistic Korean user data'

    def handle(self, *args, **options):
        fake = Faker('ko_KR')  # 한국어 locale 설정
        num_users = 30  # 생성할 사용자 수

        # nickname 생성에 사용할 단어 리스트
        first_words = ['행복한', '용감한', '똑똑한', '즐거운', '멋진', '강한', '귀여운', '친절한', '열정적인', '차분한',
                       '배려심있는', '활기찬', '명랑한', '정직한', '용의주도한', '성실한', '모험심있는', '유쾌한', '현명한', '책임감있는']

        second_words = ['곰', '상인', '호랑이', '토끼', '여우', '독수리', '돌고래', '펭귄', '부엉이', '사자', '늑대', '강아지', 
                        '고양이', '나비', '다람쥐', '판다', '하마', '타조', '고래', '악어', '치타', '코끼리', '오리', '수달',
                        '염소', '양', '공룡', '캥거루', '원숭이', '코뿔소', '개구리', '참새', '비둘기', '앵무새', '소', '말',
                        '돼지', '사슴', '코알라', '너구리', '고릴라', '카피바라', '이구아나', '수리', '도마뱀', '두더지', 
                        '햄스터', '라쿤', '까마귀', '고슴도치']


        # 소개 문구 리스트
        introduces = [
            "안녕하세요",
            "양심 있는 상인입니다.",
            "좋은 상품 많이 있습니다.",
            "빠른 거래 약속드립니다.",
            "믿고 거래하세요.",
            "항상 최선을 다합니다.",
            "고객 만족이 우선입니다.",
            "문의사항 언제든지 환영합니다.",
            "즐거운 하루 되세요.",
            "저렴한 가격에 드립니다.",
            "친절한 서비스 제공하겠습니다.",
            "최고의 품질을 보장합니다.",
            "정직한 거래를 약속합니다.",
            "감사합니다.",
            "다시 찾아주세요."
        ]

        # num_users 만큼 반복하며 유저 데이터 생성
        for _ in range(num_users):
            username = fake.user_name()
            password = fake.password(length=10)

            name = fake.name()
            nickname = random.choice(first_words) + random.choice(second_words)

            postcode = fake.postcode()
            city = fake.city()
            mainaddress = f"{city} {fake.street_name()} {fake.building_number()}"
            subaddress = f"{city} {fake.street_address()}"
            email = fake.email()
            birth = fake.date_of_birth(minimum_age=18, maximum_age=65) # 나이는 min~max 에서 랜덤

            introduce = random.choice(introduces)

            user = User.objects.create(
                username=username,
                email=email,
                name=name,
                nickname=nickname,
                postcode=postcode,
                mainaddress=mainaddress,
                subaddress=subaddress,
                birth=birth,
                introduce=introduce,
                created_at=timezone.now(),
            )
            
            # 비밀번호 해싱
            user.set_password(password)

            # 유저 데이터 저장
            user.save()

            # 사용자 ID & 해싱 전 비밀번호 출력
            print(f"ID: {user.username}, Password: {password}")

        self.stdout.write(self.style.SUCCESS('사용자 데이터 시딩이 완료되었습니다.'))