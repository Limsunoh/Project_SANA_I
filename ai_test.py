import openai

openai.api_key = "sk--tGHTI1Cx3P8l9R96D-mHxA1ft19Upo_Vau7MyL8fFT3BlbkFJ-sCf0PfErU0Oqu-cntROMJh8o599ivYIfCl_G69ckA"
try:
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "안녕하세요"}]
    )
    print(response.choices[0].message.content)
except Exception as e:
    print(f"오류 발생: {e}")