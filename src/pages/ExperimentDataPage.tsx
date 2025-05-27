// src/pages/ExperimentDataPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, // V3 Card [cite: 2528]
  Box,
  Heading,
  Text,
  Spinner,
  Alert,
  // AlertIcon, // V3 使用 Alert.Indicator
  Button,
  VStack,
  Table, 
  Flex,
  Tag, // V3 Tag [cite: 3647]
} from '@chakra-ui/react';
import type { QueryDataResponse, GaitDataRecord } from '../types'; // 确保路径正确

const API_BASE_URL = 'gait.worker.zjhstudio.com'; // 替换为您的Worker URL

// GaitDataRecord 中 quaternions 是字符串，所以我们需要一个新类型给解析后的数据
interface ParsedGaitDataRecord extends Omit<GaitDataRecord, 'quaternions'> {
  quaternions_parsed: Array<{ w: number; x: number; y: number; z: number }>;
}


function ExperimentDataPage() {
  const { experimentName } = useParams<{ experimentName: string }>();
  const navigate = useNavigate();

  const [experimentDetails, setExperimentDetails] = useState<QueryDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!experimentName) {
      setError("实验名称未提供。");
      setIsLoading(false);
      return;
    }

    const fetchExperimentData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/data/experiment?name=${encodeURIComponent(experimentName)}`);
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(`获取实验数据失败 (${response.status}): ${errData.message}`);
        }
        const data: QueryDataResponse = await response.json();
        setExperimentDetails(data);
      } catch (err: any) {
        setError(err.message || '加载实验数据时发生未知错误');
        console.error("Fetch experiment data error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperimentData();
  }, [experimentName]);

  const handleDownloadJson = () => {
    if (!experimentDetails) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(experimentDetails, null, 2) // 格式化输出
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${experimentDetails.experiment_name}_data.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  
  // CSV 下载会复杂一些，因为 quaternions 是数组对象，需要决定如何展平
  // const handleDownloadCsv = () => { /* ... */ };


  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return (
      <VStack spacing={4}>
        <Alert.Root status="error"> {/* V3 Alert [cite: 2441] */}
          <Alert.Indicator />
          <Alert.Title>{error}</Alert.Title>
        </Alert.Root>
        <Button onClick={() => navigate('/')} colorPalette="gray">返回实验列表</Button>
      </VStack>
    );
  }

  if (!experimentDetails) {
    return (
      <VStack spacing={4}>
        <Text>未找到实验数据或实验仍在进行中。</Text>
        <Button onClick={() => navigate('/')} colorPalette="gray">返回实验列表</Button>
      </VStack>
    );
  }
  
  // 前端解析 quaternions 字符串
  const parsedGaitDataRecords: ParsedGaitDataRecord[] = experimentDetails.gait_data_records.map(record => {
    let parsedQuaternions: Array<{ w: number; x: number; y: number; z: number }> = [];
    try {
      if (record.quaternions) { // 确保字符串存在
        parsedQuaternions = JSON.parse(record.quaternions);
      }
    } catch (e) {
      console.error(`前端解析quaternions失败 (device: ${record.device}, ts: ${record.timestamp}):`, record.quaternions, e);
      // 如果解析失败，quaternions_parsed 会是空数组，或者您可以设置一个错误标记
    }
    return {
      ...record, // 包含 device, timestamp, note, 以及原始的 quaternions 字符串
      quaternions_parsed: parsedQuaternions 
    };
  });

  return (
    <VStack spacing={6} align="stretch">
      <Button onClick={() => navigate('/')} alignSelf="flex-start" variant="outline" size="sm">
        &larr; 返回实验列表
      </Button>
      <Heading as="h2" size="xl">
        实验数据: <Text as="span" color="teal.600">{experimentDetails.experiment_name}</Text>
      </Heading>
      
      <Card.Root variant="outline"> {/* V3 Card [cite: 2528] */}
        <Card.Header>
          <Heading size="md">实验详情</Heading>
        </Card.Header>
        <Card.Body> {/* V3 Card.Body [cite: 2528] */}
          <VStack align="stretch" spacing={3}>
            <Flex>
              <Text fontWeight="semibold" w="120px">开始时间:</Text> 
              <Text>{new Date(experimentDetails.start_time).toLocaleString()}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="semibold" w="120px">结束时间:</Text> 
              <Text>{experimentDetails.end_time ? new Date(experimentDetails.end_time).toLocaleString() : <Tag colorPalette="orange">进行中</Tag>}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="semibold" w="120px">会话备注:</Text> 
              <Text whiteSpace="pre-wrap">{experimentDetails.session_notes || '无'}</Text>
            </Flex>
            <Flex>
              <Text fontWeight="semibold" w="120px">数据点数量:</Text> 
              <Text>{experimentDetails.data_count}</Text>
            </Flex>
          </VStack>
        </Card.Body>
        <Card.Footer> {/* V3 Card.Footer [cite: 2528] */}
           <Button colorPalette="green" onClick={handleDownloadJson} isDisabled={experimentDetails.gait_data_records.length === 0}>
            下载 JSON
          </Button>
          {/* <Button colorPalette="blue" onClick={handleDownloadCsv} ml={4} isDisabled={experimentDetails.gait_data_records.length === 0}>下载 CSV</Button> */}
        </Card.Footer>
      </Card.Root>
      
      <Heading as="h3" size="lg" mt={6} mb={4}>
        步态数据记录 (前100条预览)
      </Heading>
      {parsedGaitDataRecords.length > 0 ? (
         <Box borderWidth="1px" borderRadius="md" overflowX="auto">
            <Table.Root variant="simple" size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>设备</Table.ColumnHeader>
                  <Table.ColumnHeader>时间戳 (UTC)</Table.ColumnHeader>
                  <Table.ColumnHeader>四元数 (样本数)</Table.ColumnHeader>
                  <Table.ColumnHeader>数据备注</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {parsedGaitDataRecords.slice(0, 100).map((record, index) => (
                  <Table.Row key={`${record.device}-${record.timestamp}-${index}`}>
                    <Table.Cell>{record.device}</Table.Cell>
                    <Table.Cell>{new Date(record.timestamp).toLocaleString()}</Table.Cell>
                    <Table.Cell>
                      {record.quaternions_parsed.length} 个样本
                      {/* 简单展示第一个样本的w值作为示例 */}
                      {record.quaternions_parsed.length > 0 && ` (w1: ${record.quaternions_parsed[0].w.toFixed(2)})`}
                    </Table.Cell>
                    <Table.Cell>{record.note || '-'}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
         </Box>
      ) : (
        <Text>此实验没有相关的步态数据记录（或实验未结束）。</Text>
      )}
    </VStack>
  );
}

export default ExperimentDataPage;