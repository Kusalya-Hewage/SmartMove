package com.smartmove.smartmove.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${smartmove.upload.directory:uploads}")
    private String uploadDirectory;




    public String storeVehicleFile(
            MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new RuntimeException(
                    "Please select a file."
            );
        }


        try {



            Path uploadPath =
                    Paths.get(uploadDirectory)
                            .toAbsolutePath()
                            .normalize();

            Files.createDirectories(uploadPath);


            String originalFileName =
                    StringUtils.cleanPath(
                            file.getOriginalFilename() == null
                                    ? "document"
                                    : file.getOriginalFilename()
                    );




            String extension = "";

            int dotIndex =
                    originalFileName.lastIndexOf(".");

            if (dotIndex > 0) {

                extension =
                        originalFileName.substring(dotIndex);
            }




            String storedFileName =
                    UUID.randomUUID()
                            + extension;


            Path targetPath =
                    uploadPath
                            .resolve(storedFileName)
                            .normalize();


            // Security validation
            if (!targetPath.startsWith(uploadPath)) {

                throw new RuntimeException(
                        "Invalid file path."
                );
            }


            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );




            return "/uploads/" + storedFileName;


        } catch (IOException e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Unable to save file: "
                            + e.getMessage(),
                    e
            );
        }
    }



    public void deleteVehicleFile(
            String filePath) {

        if (filePath == null
                || filePath.isBlank()) {

            return;
        }


        try {

            String fileName =
                    filePath
                            .replace("/uploads/", "")
                            .replace("\\uploads\\", "");


            Path uploadPath =
                    Paths.get(uploadDirectory)
                            .toAbsolutePath()
                            .normalize();


            Path targetPath =
                    uploadPath
                            .resolve(fileName)
                            .normalize();


            if (!targetPath.startsWith(uploadPath)) {
                return;
            }


            Files.deleteIfExists(
                    targetPath
            );


        } catch (IOException e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Unable to delete file: "
                            + e.getMessage(),
                    e
            );
        }
    }
}