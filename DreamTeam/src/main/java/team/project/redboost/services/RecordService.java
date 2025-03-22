package team.project.redboost.services;

import team.project.redboost.entities.Record;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;

public interface RecordService {
    Record createRecord(Record record) throws Exception;

    List<Record> getAllRecords();

    Optional<Record> getRecordById(Long id);

    Record updateRecord(Long id, Record record) throws Exception;

    void deleteRecord(Long id);

}