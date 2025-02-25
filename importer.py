import requests

def upload_file_to_wix(api_key, file_path, file_name):
    url = "https://www.wixapis.com/media/upload"
    
    headers = {
        "Authorization": f"Bearer {api_key}",  # Ensure it's prefixed with Bearer
        "Content-Type": "application/json"
    }
    
    payload = {
        "fileName": file_name,
        "mediaType": "image"
    }
    
    response = requests.post(url, headers=headers, json=payload)
    
    print("Response Status Code:", response.status_code)
    print("Response Text:", response.text)  # Print the raw response before parsing

    if response.status_code != 200:
        print("Failed to get upload URL.")
        return

    try:
        upload_data = response.json()
    except requests.exceptions.JSONDecodeError:
        print("Error: Response is not in JSON format")
        return
    
    upload_url = upload_data.get("uploadUrl")
    file_id = upload_data.get("fileId")
    
    if not upload_url:
        print("Upload URL not received.")
        return
    
    with open(file_path, "rb") as file:
        upload_response = requests.put(upload_url, data=file, headers={"Content-Type": "application/octet-stream"})
    
    if upload_response.status_code == 200:
        print("File uploaded successfully! File ID:", file_id)
        return file_id
    else:
        print("File upload failed:", upload_response.text)
        return None

# Example usage
api_key = "IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcImI4NTczMjVkLTZkZTgtNDNkMS1iZjgyLWRhNGVmYWY4N2Y2N1wiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcImFkMzIxZTg4LTgyYTgtNDk3NC1hZjllLTk5NDhiN2JjZGYzN1wifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJhOTEzNDM3Zi00ZWEzLTQ4OWUtYThkYi1mZWY5YTA3NDUyYWRcIn19IiwiaWF0IjoxNzM5Nzg1OTg5fQ.CWo94mirSPO44zFM2XSYpVOL7HdZHRpQ2KR57FhmDvlHaw0bDSFqWdfYehPn464fSWRba0UKGde_GJ7iXQf_kIJekRaPu3X0Bhc9Y9rpU-Z8dKj7KkQV6Q5TkAiJuBtGReXgSQt099ajDHI7-yC-SkCjJJvQJZJ3zsJRAJWaMFDNnMI0OEq85_gmu8WZs-ZRMKRJIweQAMMl78ipsXW-1Ik5jYfc-O87Sooe_LYx6K1o0GRbza9v32NveE234HZuEcmyMlv-qGEn6FGL1baUuZ-QbbskDRu54Re0b0hMgDD9bJT9Vnfyiu6IBfg9LmIf0wTjTkVjFvllAvLtpNmJJA"  # Replace with your actual API key
file_path = "images/1.jpeg"  # Replace with your actual file path
file_name = "file.jpg"  # Replace with your desired file name

upload_file_to_wix(api_key, file_path, file_name)
