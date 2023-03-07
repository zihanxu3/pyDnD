import os
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import shutil
from dotenv import load_dotenv
load_dotenv('.env')

"""
    File Handling Module.
    @author Zihan Xu
"""

AZURE_STORAGE_CONNECTION_STRING = os.environ.get(
    'AZURE_STORAGE_CONNECTION_STRING'
)

blob_service_client = BlobServiceClient.from_connection_string(
    AZURE_STORAGE_CONNECTION_STRING
)

# Upload a `file` to user's blob corresp to `uid`.
def uploadFile(file, uid):
    container = ContainerClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING, container_name=uid)
    if not container.exists():
        container.create_container()
    blob_client = blob_service_client.get_blob_client(container=uid, blob=file.filename)
    print("\nUploading to blob storage:\n\t" + file.filename)
    if not blob_client.exists():
        blob_client.upload_blob(file)

# List all file (names) within a user's blob.
def listFilesInContainer(uid):
    container = ContainerClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING, container_name=uid)
    if not container.exists():
        return []
    print("\nListing blobs...")

    blob_list = container.list_blobs()
    res = [file.name for file in blob_list]
    print(res)
    return res 

# Download a file from blob to local for execution.
def downloadFileWithName(uid, fileName):
    local_path = './data'
    if os.path.exists(local_path):
        shutil.rmtree(local_path)
    os.makedirs(local_path)
    download_file_path = os.path.join(local_path, fileName)
    print(download_file_path, fileName, uid)
    container_client = blob_service_client.get_blob_client(container=uid,blob=fileName) 
    print("\nDownloading blob to \n\t" + download_file_path)

    with open(file=download_file_path, mode="wb") as download_file:
        blob_data = container_client.download_blob()
        blob_data.readinto(download_file)
    return open(file=download_file_path, mode="r")

# Download a file from blob to local for execution, as bytes.
def downloadFileWithNameAsBytes(uid, fileName):
    local_path = './data'
    if os.path.exists(local_path):
        shutil.rmtree(local_path)
    os.makedirs(local_path)
    download_file_path = os.path.join(local_path, fileName)
    print(download_file_path, fileName, uid)
    container_client = blob_service_client.get_blob_client(container=uid,blob=fileName) 
    print("\nDownloading blob to \n\t" + download_file_path)

    with open(file=download_file_path, mode="wb") as download_file:
        blob_data = container_client.download_blob()
        blob_data.readinto(download_file)
    return open(file=download_file_path, mode="rb")
    