import os
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import shutil

AZURE_STORAGE_CONNECTION_STRING = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')
blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)

def uploadFile(file, uid):
    container = ContainerClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING, container_name=uid)
    if not container.exists():
        container.create_container()
    blob_client = blob_service_client.get_blob_client(container=uid, blob=file.filename)
    print("\nUploading to Azure Storage as blob:\n\t" + file.filename)
    if not blob_client.exists():
        # Upload the created file
        blob_client.upload_blob(file)

def listFilesInContainer(uid):
    container = ContainerClient.from_connection_string(conn_str=AZURE_STORAGE_CONNECTION_STRING, container_name=uid)
    if not container.exists():
        return []
    print("\nListing blobs...")

    # List the blobs in the container
    blob_list = container.list_blobs()
    res = [file.name for file in blob_list]
    print(res)
    return res 

def downloadFileWithName(uid, fileName, local_path):
    download_file_path = os.path.join(local_path, fileName)
    print(download_file_path, fileName, uid)
    container_client = blob_service_client.get_blob_client(container=uid,blob=fileName) 
    print("\nDownloading blob to \n\t" + download_file_path)

    with open(file=download_file_path, mode="wb") as download_file:
        blob_data = container_client.download_blob()
        blob_data.readinto(download_file)
    return open(file=download_file_path, mode="r")
    
# def testDownloadFiles(uid):
#     local_path = './data'
#     if os.path.exists(local_path):
#         shutil.rmtree(local_path)
#     os.makedirs(local_path)
#     download_file_path = os.path.join(local_path, "zhianDOWNLOAD.pdf")
#     container_client = blob_service_client.get_blob_client(container=uid,blob='zx294_prelim2.pdf') 
#     print("\nDownloading blob to \n\t" + download_file_path)

#     with open(file=download_file_path, mode="wb") as download_file:
#         blob_data = container_client.download_blob()
#         blob_data.readinto(download_file)
    