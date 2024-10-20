# 한국어로 상품 데이터를 시딩하기 위한 명령어
# media\images 에 default_image.jpg 라는 이름을 가진 이미지 파일을 넣어야 정상 작동
# 터미널에 python manage.py seed_products 를 입력해 num_products 만큼의 상품 데이터 생성

from django.core.management.base import BaseCommand
from products.models import Product, Hashtag, Image
from accounts.models import User
import random
from django.core.files import File
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seed the database with products where titles, content, and tags are related'

    def handle(self, *args, **options):
        # 사용자 가져오기
        users = User.objects.all()

        # 카테고리별 데이터 정의
        product_data = [
                        {
                'category': '전자제품',
                'titles': [
                    '최신 스마트폰 판매합니다',
                    '게이밍 노트북 저렴하게 판매',
                    '태블릿 PC 거의 새 것 판매합니다',
                    '스마트 워치 판매 중',
                    '무선 이어폰 중고로 판매합니다',
                    '데스크탑 컴퓨터 판매',
                    '카메라 렌즈 저렴하게 판매합니다',
                    '게임 콘솔 판매합니다',
                    '모니터 새 것처럼 사용한 제품 판매',
                    '키보드와 마우스 세트 판매',
                    '중고 프린터기 판매합니다',
                    '무선 라우터 판매',
                    '고급 블루투스 스피커 판매합니다',
                    '차량용 내비게이션 판매',
                    '전기 자전거 배터리 판매',
                    '헤드셋 거의 새 제품 판매',
                    '그래픽카드 업그레이드로 인한 판매',
                    '노트북 거치대 판매합니다',
                    '프로젝터 판매합니다',
                    'VR 헤드셋 중고 판매'
                ],
                'descriptions': [
                    '사용 기간은 6개월이며, 상태는 매우 좋습니다. 스크래치나 손상은 전혀 없으며 모든 기능이 완벽하게 작동합니다. 박스 및 모든 구성품을 포함하여 판매합니다.',
                    '사용 기간은 1년이며, 상태는 매우 좋습니다. 생활 기스가 약간 있지만 성능에는 문제가 없습니다. 빠른 거래를 원합니다.',
                    '구매 후 거의 사용하지 않아 새 것과 다름없습니다. 상태는 아주 양호하며 추가 액세서리도 함께 드립니다. 직거래 가능합니다.',
                    '이사로 인해 급하게 판매합니다. 사용 기간은 짧지만 정상 작동하며 상태는 아주 좋습니다. 직거래 선호합니다.',
                    '약간 기스 있는거 외에는 정상 작동합니다. 구매 후 만족도가 높았지만 다른 제품으로 교체하여 판매합니다. 충전기와 케이스 포함입니다.',
                    '상자를 포함한 모든 부품이 있습니다. 몇 번 사용했지만 성능에는 전혀 문제가 없습니다. 빠른 거래 원합니다.',
                    '새 제품과 비교해도 무방할 정도로 깨끗합니다. 사용 기간은 3개월이며, 보증 기간도 남아 있습니다. 구매자에게 좋은 선택이 될 것입니다.',
                    '오래 사용하지 않아서 상태가 양호합니다. 모든 기능이 정상 작동하며, 추가 컨트롤러도 포함되어 있습니다. 직접 확인 후 구매 가능합니다.',
                    '제품 보증기간이 남아 있으며, 상태는 거의 새 것과 같습니다. 사용 시간도 매우 짧아 새 제품을 찾으시는 분께 적합합니다.',
                    '정상 작동하며, 테스트 완료했습니다. 사무실에서 잠시 사용한 제품으로 상태는 매우 좋습니다. 빠른 거래 시 할인 가능합니다.',
                    '구매 후 몇 번 사용하지 않았습니다. 상태는 거의 새 것과 동일하며, 모든 케이블과 부속품이 포함되어 있습니다. 직거래만 가능합니다.',
                    '포장이 훼손되지 않은 완전 새 제품입니다. 사용 기간은 짧으며, 성능에 문제가 없음을 보장합니다. 직거래로만 판매합니다.',
                    '생활 기스가 조금 있지만 성능에는 문제가 없습니다. 추가 케이블과 설명서를 함께 드립니다. 가격 협의 가능합니다.',
                    '업그레이드로 인한 판매, 성능 보장합니다. 상태는 매우 좋으며, 오리지널 박스와 구성품이 포함되어 있습니다. 빠른 거래 희망합니다.',
                    '빠른 거래 원합니다, 에누리 가능합니다. 몇 번 사용했으나 상태는 매우 양호합니다. 직거래 가능합니다.',
                    '충전기와 모든 부속품이 포함됩니다. 사용 기간이 짧아 거의 새 제품과 다름없습니다. 박스와 보증서도 함께 드립니다.',
                    '정상적인 사용 흔적이 조금 있습니다. 성능에는 전혀 문제가 없으며, 추가 액세서리도 함께 드립니다. 빠른 연락 바랍니다.',
                    '사용 설명서와 함께 드립니다. 상태는 양호하며, 업그레이드로 인해 판매하는 제품입니다. 구매 후 바로 사용 가능합니다.',
                    '새 제품과 거의 동일한 상태입니다. 사용 기간은 6개월이며, 모든 기능이 정상적으로 작동합니다. 빠른 거래를 희망합니다.',
                    '성능에 전혀 문제가 없는 제품입니다. 몇 번 사용했으나 상태는 새 것과 다름없습니다. 가격 협의 가능합니다.'
                ],
                'tags': ['전자제품', 'IT기기', '중고', '판매', '급매']
            },
            {
                'category': '패션',
                'titles': [
                    '여성용 여름 원피스 판매',
                    '남성 정장 세트 저렴하게 판매',
                    '스니커즈 사이즈 미스로 판매합니다',
                    '겨울용 코트 저렴하게 판매합니다',
                    '스포츠 레깅스 새 것 판매',
                    '가죽 재킷 상태 좋음',
                    '명품 핸드백 판매합니다',
                    '캐주얼 티셔츠 판매 중',
                    '아웃도어 자켓 판매합니다',
                    '구두 사이즈 미스로 판매',
                    '남성용 패딩 판매',
                    '트레이닝복 상하의 세트 판매',
                    '여성용 블라우스 판매 중',
                    '봄 가을용 트렌치코트 판매',
                    '디자이너 브랜드 드레스 판매',
                    '여름 샌들 저렴하게 판매합니다',
                    '남성용 베스트 판매',
                    '캡 모자 새 것처럼 판매',
                    '피트니스 의류 저렴하게 판매',
                    '디자이너 시계 판매합니다'
                ],
                'descriptions': [
                    '사이즈 미스로 한 번도 착용하지 않았습니다. 새 제품과 다를 바 없으며, 착용감도 매우 편안합니다. 직거래로 빠른 거래 원합니다.',
                    '구매 후 보관만 했습니다. 거의 사용하지 않아 상태는 매우 양호합니다. 특별한 손상 없이 깨끗한 상태입니다.',
                    '직접 입어보시고 결정하세요. 새 상품과 같은 상태이며, 디자인이 세련되었습니다. 색상과 사이즈 모두 만족스러울 것입니다.',
                    '구매 후 단 한 번 착용했습니다. 상태는 매우 좋으며, 겨울철에 따뜻하게 입기 좋은 아이템입니다. 빠른 거래 원합니다.',
                    '상태는 매우 양호하며, 세탁 완료했습니다. 편안한 착용감과 더불어 스포츠 활동에 적합한 아이템입니다. 저렴하게 내놓습니다.',
                    '포장 그대로 새 것 판매합니다. 전혀 손상되지 않았으며, 패션 아이템으로 추천합니다. 직거래 가능합니다.',
                    '브랜드 정품이며, 상태는 아주 좋습니다. 몇 번 사용했으나 외관상 전혀 문제가 없습니다. 패션 아이템으로 훌륭한 선택이 될 것입니다.',
                    '디자인이 세련되고 편안한 착용감을 자랑합니다. 여러 번 세탁했지만 상태는 거의 새 것과 같습니다. 직거래 가능합니다.',
                    '이월 상품으로 저렴하게 판매합니다. 상태는 양호하며, 기능적인 부분에서 문제없이 착용 가능합니다. 빠른 거래 원합니다.',
                    '컬러가 너무 예뻐요, 추천합니다. 상태는 새 것과 같으며, 저렴하게 판매합니다. 사이즈 맞으시는 분께 강력 추천드립니다.',
                    '사이즈 조정 실패로 저렴하게 내놓습니다. 사용하지 않은 상태이며, 새 제품과 다를 바 없습니다. 빠른 거래 원합니다.',
                    '상태는 거의 새 것과 같아요. 세련된 디자인으로, 다양한 장소에서 착용하기 좋습니다. 직거래 희망합니다.',
                    '구매 후 보관만 해서 손상이 없습니다. 착용감을 한번도 경험하지 못한 상태로, 완벽한 컨디션입니다. 빠른 거래 원합니다.',
                    '매장가보다 훨씬 저렴하게 드립니다. 단 한 번도 착용하지 않았으며, 패키지도 그대로 보관 중입니다. 빠른 거래 원합니다.',
                    '브랜드 제품이며 착용감이 좋습니다. 구매 후 몇 번 입었지만 상태는 매우 양호합니다. 상태를 확인하고 직접 구매 가능합니다.',
                    '원단 상태가 아주 좋아요, 추천합니다. 여러 번 입었지만 관리가 잘 되어 있습니다. 사용 흔적은 거의 없습니다.',
                    '여러 번 입었지만 관리가 잘 되어 있습니다. 사이즈는 정사이즈로 적합하며, 직거래 가능합니다. 빠른 거래 원합니다.',
                    '구매 후 착용 횟수가 적습니다. 매우 깨끗한 상태이며, 색상이 너무 예쁩니다. 직거래 선호합니다.',
                    '편안하고 세련된 스타일의 제품입니다. 운동 시 착용하기 좋으며, 상태는 매우 좋습니다. 빠른 거래를 원합니다.',
                    '급매로 저렴하게 판매합니다. 사용감이 없으며, 브랜드 제품으로 매우 상태가 좋습니다. 직거래 가능합니다.'
                ],
                'tags': ['패션', '의류', '신발', '잡화', '명품']
            },
            {
                'category': '스포츠 및 레저',
                'titles': [
                    '중고 자전거 저렴하게 판매합니다',
                    '캠핑용 텐트 상태 좋음 판매',
                    '골프 클럽 세트 판매',
                    '스노우보드 장비 중고로 판매합니다',
                    '낚시 장비 풀 세트 저렴하게 판매',
                    '헬스 트레이닝 기구 판매',
                    '축구 공과 신발 세트 판매',
                    '스쿠버다이빙 장비 판매합니다',
                    '요가 매트와 블록 세트 저렴하게 판매',
                    '배드민턴 라켓과 셔틀콕 세트 판매',
                    '산악 자전거 판매 중',
                    '테니스 라켓 새 것처럼 판매',
                    '런닝 머신 급매로 판매합니다',
                    '클라이밍 장비 세트 중고 판매',
                    '캠핑 의자와 테이블 세트 판매',
                    '스케이트보드 중고 판매합니다',
                    '카약 장비 판매합니다',
                    '러닝용 스마트워치 판매 중',
                    '중고 배드민턴 라켓 판매',
                    '실내 사이클 판매합니다'
                ],
                'descriptions': [
                    '사용감이 있지만, 여전히 좋은 상태를 유지하고 있습니다. 사용 후 보관에 신경을 써왔으며, 기능적으로 문제가 없습니다.',
                    '일정 시간 동안 사용되었으나, 관리가 잘 되어 있어 현재도 충분히 사용할 수 있는 상태입니다. 기본적인 유지 보수가 필요할 수 있습니다.',
                    '외관상 약간의 사용 흔적이 있지만, 전체적으로 양호한 상태를 유지하고 있습니다. 성능은 그대로 유지되고 있습니다.',
                    '보관 상태가 좋고, 실내외에서 모두 사용 가능합니다. 다소의 마모가 있지만 여전히 충분히 사용 가능합니다.',
                    '사용 흔적은 있지만, 일반적인 사용 환경에서 성능 저하는 없습니다. 추가적인 장비와 함께 사용하면 더욱 유용할 수 있습니다.',
                    '다소 오래 사용되었지만 기능적으로는 아무 문제가 없습니다. 운동 및 취미 활동을 위한 기본 장비로 적합합니다.',
                    '일반적인 사용 흔적이 있으며, 기본적인 청소 및 관리가 이루어졌습니다. 성능에 큰 영향은 없으며, 추가적인 장비도 쉽게 구할 수 있습니다.',
                    '기능적으로 문제가 없으며, 전체적으로 상태가 양호합니다. 유지 관리가 용이하고 추가적인 조정이 필요 없습니다.',
                    '외관은 일부 사용감이 있지만 성능에는 영향을 미치지 않습니다. 지속적인 사용에도 문제 없이 작동합니다.',
                    '약간의 마모가 있을 수 있으나, 기능적으로는 완벽히 작동합니다. 추가적인 유지 보수를 고려할 수 있습니다.',
                    '사용 후에도 상태가 양호하며, 지속적으로 사용할 수 있는 상태를 유지하고 있습니다. 성능에 문제가 발생한 적은 없습니다.',
                    '기본적인 유지 보수를 마쳤으며, 더 오랜 시간 동안 사용할 수 있는 상태입니다. 사용 후에도 문제없이 작동합니다.',
                    '일부 부품에 교체가 필요할 수 있지만, 전반적으로 양호한 상태를 유지하고 있습니다. 기본적인 사용에는 전혀 문제가 없습니다.',
                    '보관 상태가 양호하며, 지속적인 사용이 가능합니다. 추가적인 부속품과 함께 사용하기에도 적합합니다.',
                    '약간의 사용 흔적은 있지만, 전체적으로 양호한 상태를 유지하고 있습니다. 성능에는 큰 영향이 없습니다.',
                    '썩 상태가 좋진 않으나 외관상으로는 문제 없습니다. 장식용으로는 제격입니다.',
                    '기능적으로 문제가 없으며, 외관 또한 좋은 상태입니다. 오랜 기간 사용할 수 있는 제품입니다.',
                    '사용 중 일부 마모가 발생했으나, 기능적으로는 문제가 없습니다. 추가적인 유지 보수가 필요할 수 있습니다.',
                    '성능은 그대로 유지되며, 사용 후에도 문제가 발생하지 않았습니다. 유지 관리가 쉬워 오래 사용할 수 있습니다.',
                    '일부 사용 흔적이 남아 있지만 성능에는 전혀 문제가 없습니다. 추가적인 관리나 조정이 필요하지 않습니다.'
                ],
                'tags': ['스포츠', '레저', '중고', '판매', '캠핑', '운동']
            },
            {
                'category': '식품',
                'titles': [
                    '내 집 냉장고에 있던 신선한 바나나 판매',
                    '선물 받은 고급 커피 원두 되팜',
                    '안 먹게 된 제철 과일 판매합니다',
                    '한 번도 안 뜯은 친환경 유기농 야채 세트',
                    '유통기한 넉넉한 수제 빵 팝니다',
                    '이사로 인해 남은 고급 와인 판매',
                    '너무 많아서 남은 자연산 꿀 판매',
                    '이벤트로 받은 해산물 세트 되팔아요',
                    '남은 수제 케이크 팝니다',
                    '안 먹는 디저트 세트 처분함'
                ],
                'descriptions': [
                    '인기 있다 해서 많이 샀었는데 맛을 보니 영 아닌 것 같아 처분합니다. 제 입맛에는 안 맞는 것 같지만, 다른 분의 입맛에는 맞을 지도 모릅니다.',
                    '최근 많은 사람들에게 인기를 얻고 있는 식품입니다. 특별한 기회에 놓치지 마세요.',
                    '어떤 매장을 가도 구하기 어려운 식품입니다. 왜냐면 이 식품이 유통되는 족족 다 내가 사들였거든요.',
                    '다 안 먹은 채로 실온에 보관하면 밤 중에 귀신이 나타나는 저주가 있지만 그거 빼고는 문제가 없습니다.',
                    '국내의 유명한 기업에서 생산된 믿을 수 있는 음식이라고 들었어요. 소중한 사람들과 함께 드시면 좋을 것 같습니다.',
                    '다양한 요리에 곁들이기 좋은 음식입니다. 일상 속에서 쉽게 즐길 수 있습니다.',
                    '블라디미르 푸틴이 추천하는 음식이라는데, 절대 방사능은 들어있지 않다고 하더라고요. 의심된다면 한번 드셔보세요. 단, 섭취 이후의 건강은 보장하지 않아요.',
                    '최근 방송에서 핫하다고 하더라고요. 굳이 식당까지 가지 말고 집에서 편하게 드셔보는 건 어떨까요?',
                    '외관의 문제는 맛에 영향을 미치지 않습니다. 아마도... 맛있겠죠?',
                    '다 어디서 받은건데 일들이 많아 먹을 시간이 없어 그냥 내놓습니다. 그냥 방치해두는거보단 누군가라도 먹는 게 낫겠죠.'
                ],
                'tags': ['미식', '음식', '요리', '음식선물']
            }
        ]

        # 해시태그 생성 및 저장
        all_tags = set()
        for data in product_data:
            all_tags.update(data['tags'])
        hashtag_objs = {}
        for tag in all_tags:
            obj, created = Hashtag.objects.get_or_create(name=tag)
            hashtag_objs[tag] = obj

        # 상품 생성
        num_products = 20  # 생성할 상품 수
        for _ in range(num_products):

            # 상기한 카테고리 중 하나 랜덤 선택
            data = random.choice(product_data)

            # 제목, 내용, 태그 선택
            title = random.choice(data['titles'])
            content = random.choice(data['descriptions'])
            tags = [hashtag_objs[tag] for tag in data['tags']]

            # 랜덤 날짜 생성 1~30
            days_ago = random.randint(1, 30)
            random_created_at = timezone.now() - timedelta(days=days_ago)

            # 상품 생성
            product = Product(
                author=random.choice(users),
                title=title,
                content=content,
                price=str(random.randint(10000, 100000)),
                status=random.choice(['sell', 'reservation', 'complete']),
                hits=random.randint(0, 100),
            )

            # 생성일 설정 후 저장
            product.save()
            product.created_at = random_created_at  # created_at 필드 수정
            product.save(update_fields=['created_at'])  # created_at만 업데이트

            # 해시태그 설정
            product.tags.set(tags)

            # 이미지 추가
            image_path = 'media/images/default_image.jpg'
            with open(image_path, 'rb') as img_file:
                image = Image()
                image.product = product
                image.image_url.save('default_image.jpg', File(img_file), save=True)

        self.stdout.write(self.style.SUCCESS('상품 데이터 시딩이 완료되었습니다.'))