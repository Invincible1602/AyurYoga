import streamlit as st
import pandas as pd
import difflib
from joblib import dump
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load dataset
df = pd.read_csv('yoga_asanas_and_diseases.csv')

# Fill NaN values with empty strings
selected_features = [
    'Disease 1', 'Disease 2', 'Disease 3', 'Disease 4', 'Disease 5',
    'Should Not Perform Reason 1', 'Should Not Perform Reason 2',
    'Should Not Perform 3', 'Should Not Perform 4', 'Should Not Perform 5'
]
for feature in selected_features:
    df[feature] = df[feature].fillna('')

# Combine features into a single string for vectorization
combined_features = (df['Disease 1'] + ' ' +
                     df['Disease 2'] + ' ' +
                     df['Disease 3'] + ' ' +
                     df['Disease 4'] + ' ' +
                     df['Disease 5'] + ' ' +
                     df['Should Not Perform Reason 1'] + ' ' +
                     df['Should Not Perform Reason 2'] + ' ' +
                     df['Should Not Perform 3'] + ' ' +
                     df['Should Not Perform 4'] + ' ' +
                     df['Should Not Perform 5'])

# Vectorize combined features
vectorizer = TfidfVectorizer()
feature_vectors = vectorizer.fit_transform(combined_features)
similarity = cosine_similarity(feature_vectors)

# List of diseases for the dropdown menu
diseases = [
    'Anxiety', 'Digestive Issues', 'Poor Posture', 'Insomnia',
    'Asthma', 'Fatigue', 'Back Pain', 'Sciatica', 'Depression', 'Stress',
    'Endocrine Problems (Diabetes/Infertility/Thyroid)', 'Respiratory Diseases',
    'Muscular/Skeletal Problems', 'Urinary Issues', 'Nervous System (Brain Fever/Mental Disease)'
]

# Function to suggest asanas
def suggest_asanas(name):
    suggested_facilities = set()
    results = []

    for column in ['Disease 1', 'Disease 2', 'Disease 3', 'Disease 4', 'Disease 5']:
        close_match = None
        find_close_match = difflib.get_close_matches(name, df[column].tolist())
        if find_close_match:
            close_match = find_close_match[0]
            index_of_the_disease = df[df[column] == close_match]['Index'].values
            if len(index_of_the_disease) > 0:
                similarity_score = list(enumerate(similarity[index_of_the_disease[0]]))
                sorted_similar_asanas = sorted(similarity_score, key=lambda x: x[1], reverse=True)
                i = 1
                for x in sorted_similar_asanas:
                    index = x[0]
                    asana_info = df[df['Index'] == index]
                    if not asana_info.empty:
                        asana_name = asana_info['Asana Name'].values[0]
                        reasons = []
                        for j in range(1, 6):
                            column_name = f'Should Not Perform Reason {j}'
                            if column_name in asana_info.columns:
                                reason = asana_info[column_name].values[0]
                                if reason:
                                    reasons.append(reason)

                        asana_details = (asana_name, *reasons)
                        if asana_details not in suggested_facilities:
                            suggested_facilities.add(asana_details)
                            if i <= 20:
                                results.append(
                                    {
                                        "Asana Name": asana_name,
                                        "Reasons Not to Perform": reasons
                                    }
                                )
                                i += 1

    dump(suggested_facilities, 'suggested_facilities')
    return results

# Streamlit UI
st.set_page_config(page_title="Yoga Asana Suggestion System", layout="wide", page_icon="🧘‍♀️")

st.title("🧘‍♀️ Yoga Asana Suggestion System")
st.write("Select a disease from the sidebar to get personalized yoga asana suggestions.")

# Sidebar for disease selection
st.sidebar.header("Select Disease")
selected_disease = st.sidebar.selectbox("Diseases", diseases)

# Display instructions
st.markdown("### Instructions")
st.write("""
1. Select a disease from the dropdown on the left.
2. Click on the "Get Asana Suggestions" button to see recommendations.
3. Review the suggestions and reasons not to perform certain asanas.
""")

# Button to generate suggestions
if st.button("Get Asana Suggestions"):
    st.subheader("Suggested Yoga Asanas")
    suggestions = suggest_asanas(selected_disease)
    if suggestions:
        for i, suggestion in enumerate(suggestions, start=1):
            st.markdown(f"#### {i}. {suggestion['Asana Name']}")
            if suggestion["Reasons Not to Perform"]:
                st.write("**Reasons Not to Perform:**")
                for reason in suggestion["Reasons Not to Perform"]:
                    st.markdown(f"- {reason}")
            st.write("---")
    else:
        st.warning("No asana suggestions found for the selected disease.")
